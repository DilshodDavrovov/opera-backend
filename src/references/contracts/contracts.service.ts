import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractResponseDto } from './dto/contract-response.dto';

@Injectable()
export class ContractsService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateContractDto,
  ): Promise<ContractResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    // Проверяем существование контрагента
    const counterparty = await this.prisma.counterparty.findFirst({
      where: {
        id: createDto.counterpartyId,
        organizationId,
      },
    });

    if (!counterparty) {
      throw new NotFoundException('Counterparty not found');
    }

    const contract = await this.prisma.contract.create({
      data: {
        organizationId,
        counterpartyId: createDto.counterpartyId,
        number: createDto.number,
        date: new Date(createDto.date),
        name: createDto.name,
        amount: createDto.amount,
        startDate: createDto.startDate ? new Date(createDto.startDate) : null,
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
        isActive: createDto.isActive ?? true,
      },
      include: {
        counterparty: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return contract as ContractResponseDto;
  }

  async findAll(
    userId: string,
    organizationId: string,
    includeInactive = false,
    counterpartyId?: string,
  ): Promise<ContractResponseDto[]> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = { organizationId };
    if (!includeInactive) {
      where.isActive = true;
    }
    if (counterpartyId) {
      where.counterpartyId = counterpartyId;
    }

    const contracts = await this.prisma.contract.findMany({
      where,
      include: {
        counterparty: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return contracts as ContractResponseDto[];
  }

  async findOne(
    userId: string,
    organizationId: string,
    contractId: string,
  ): Promise<ContractResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const contract = await this.prisma.contract.findFirst({
      where: {
        id: contractId,
        organizationId,
      },
      include: {
        counterparty: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract as ContractResponseDto;
  }

  async update(
    userId: string,
    organizationId: string,
    contractId: string,
    updateDto: UpdateContractDto,
  ): Promise<ContractResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const contract = await this.findOne(userId, organizationId, contractId);

    // Если обновляется контрагент, проверяем его существование
    if (updateDto.counterpartyId) {
      const counterparty = await this.prisma.counterparty.findFirst({
        where: {
          id: updateDto.counterpartyId,
          organizationId,
        },
      });

      if (!counterparty) {
        throw new NotFoundException('Counterparty not found');
      }
    }

    const updateData: any = {};
    if (updateDto.counterpartyId !== undefined) {
      updateData.counterpartyId = updateDto.counterpartyId;
    }
    if (updateDto.number !== undefined) {
      updateData.number = updateDto.number;
    }
    if (updateDto.date !== undefined) {
      updateData.date = new Date(updateDto.date);
    }
    if (updateDto.name !== undefined) {
      updateData.name = updateDto.name;
    }
    if (updateDto.amount !== undefined) {
      updateData.amount = updateDto.amount;
    }
    if (updateDto.startDate !== undefined) {
      updateData.startDate = updateDto.startDate
        ? new Date(updateDto.startDate)
        : null;
    }
    if (updateDto.endDate !== undefined) {
      updateData.endDate = updateDto.endDate
        ? new Date(updateDto.endDate)
        : null;
    }
    if (updateDto.isActive !== undefined) {
      updateData.isActive = updateDto.isActive;
    }

    const updated = await this.prisma.contract.update({
      where: { id: contractId },
      data: updateData,
      include: {
        counterparty: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated as ContractResponseDto;
  }

  async remove(
    userId: string,
    organizationId: string,
    contractId: string,
  ): Promise<void> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const contract = await this.findOne(userId, organizationId, contractId);

    // Проверяем, используется ли договор в документах
    const [
      receiptCount,
      saleCount,
      incomingCount,
      outgoingCount,
    ] = await Promise.all([
      this.prisma.goodsReceipt.count({ where: { contractId } }),
      this.prisma.goodsSale.count({ where: { contractId } }),
      this.prisma.paymentIncoming.count({ where: { contractId } }),
      this.prisma.paymentOutgoing.count({ where: { contractId } }),
    ]);

    if (receiptCount > 0 || saleCount > 0 || incomingCount > 0 || outgoingCount > 0) {
      throw new BadRequestException(
        'Cannot delete contract: it is used in documents',
      );
    }

    await this.prisma.contract.delete({
      where: { id: contractId },
    });
  }
}
