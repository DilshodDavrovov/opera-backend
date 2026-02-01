import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { CreateCashRegisterDto } from './dto/create-cash-register.dto';
import { UpdateCashRegisterDto } from './dto/update-cash-register.dto';
import { CashRegisterResponseDto } from './dto/cash-register-response.dto';

@Injectable()
export class CashRegistersService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateCashRegisterDto,
  ): Promise<CashRegisterResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const cashRegister = await this.prisma.cashRegister.create({
      data: {
        organizationId,
        name: createDto.name,
        isActive: createDto.isActive ?? true,
      },
    });

    return cashRegister as CashRegisterResponseDto;
  }

  async findAll(
    userId: string,
    organizationId: string,
    includeInactive = false,
  ): Promise<CashRegisterResponseDto[]> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = { organizationId };
    if (!includeInactive) {
      where.isActive = true;
    }

    const cashRegisters = await this.prisma.cashRegister.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return cashRegisters as CashRegisterResponseDto[];
  }

  async findOne(
    userId: string,
    organizationId: string,
    cashRegisterId: string,
  ): Promise<CashRegisterResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const cashRegister = await this.prisma.cashRegister.findFirst({
      where: {
        id: cashRegisterId,
        organizationId,
      },
    });

    if (!cashRegister) {
      throw new NotFoundException('Cash register not found');
    }

    return cashRegister as CashRegisterResponseDto;
  }

  async update(
    userId: string,
    organizationId: string,
    cashRegisterId: string,
    updateDto: UpdateCashRegisterDto,
  ): Promise<CashRegisterResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    await this.findOne(userId, organizationId, cashRegisterId);

    const updated = await this.prisma.cashRegister.update({
      where: { id: cashRegisterId },
      data: updateDto,
    });

    return updated as CashRegisterResponseDto;
  }

  async remove(
    userId: string,
    organizationId: string,
    cashRegisterId: string,
  ): Promise<void> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const cashRegister = await this.findOne(
      userId,
      organizationId,
      cashRegisterId,
    );

    // Проверяем, используется ли касса в документах
    const [receiptOrdersCount, expenseOrdersCount] = await Promise.all([
      this.prisma.cashReceiptOrder.count({
        where: { cashRegisterId },
      }),
      this.prisma.cashExpenseOrder.count({
        where: { cashRegisterId },
      }),
    ]);

    if (receiptOrdersCount > 0 || expenseOrdersCount > 0) {
      throw new BadRequestException(
        'Cannot delete cash register: it is used in documents',
      );
    }

    await this.prisma.cashRegister.delete({
      where: { id: cashRegisterId },
    });
  }
}
