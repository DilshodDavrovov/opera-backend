import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { CreateCounterpartyDto } from './dto/create-counterparty.dto';
import { UpdateCounterpartyDto } from './dto/update-counterparty.dto';
import { CounterpartyResponseDto } from './dto/counterparty-response.dto';

@Injectable()
export class CounterpartiesService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateCounterpartyDto,
  ): Promise<CounterpartyResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const counterparty = await this.prisma.counterparty.create({
      data: {
        organizationId,
        name: createDto.name,
        inn: createDto.inn,
        kpp: createDto.kpp,
        address: createDto.address,
        phone: createDto.phone,
        email: createDto.email,
        isActive: createDto.isActive ?? true,
      },
    });

    return counterparty as CounterpartyResponseDto;
  }

  async findAll(
    userId: string,
    organizationId: string,
    includeInactive = false,
  ): Promise<CounterpartyResponseDto[]> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = { organizationId };
    if (!includeInactive) {
      where.isActive = true;
    }

    const counterparties = await this.prisma.counterparty.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return counterparties as CounterpartyResponseDto[];
  }

  async findOne(
    userId: string,
    organizationId: string,
    counterpartyId: string,
  ): Promise<CounterpartyResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const counterparty = await this.prisma.counterparty.findFirst({
      where: {
        id: counterpartyId,
        organizationId,
      },
    });

    if (!counterparty) {
      throw new NotFoundException('Counterparty not found');
    }

    return counterparty as CounterpartyResponseDto;
  }

  async update(
    userId: string,
    organizationId: string,
    counterpartyId: string,
    updateDto: UpdateCounterpartyDto,
  ): Promise<CounterpartyResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const counterparty = await this.findOne(
      userId,
      organizationId,
      counterpartyId,
    );

    const updated = await this.prisma.counterparty.update({
      where: { id: counterpartyId },
      data: updateDto,
    });

    return updated as CounterpartyResponseDto;
  }

  async remove(
    userId: string,
    organizationId: string,
    counterpartyId: string,
  ): Promise<void> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const counterparty = await this.findOne(
      userId,
      organizationId,
      counterpartyId,
    );

    // Проверяем, используется ли контрагент в документах или договорах
    const contractsCount = await this.prisma.contract.count({
      where: { counterpartyId },
    });

    if (contractsCount > 0) {
      throw new BadRequestException(
        'Cannot delete counterparty: it has associated contracts',
      );
    }

    await this.prisma.counterparty.delete({
      where: { id: counterpartyId },
    });
  }
}
