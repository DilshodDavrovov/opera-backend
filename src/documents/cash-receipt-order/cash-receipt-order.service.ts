import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { CreateCashReceiptOrderDto } from './dto/create-cash-receipt-order.dto';
import { UpdateCashReceiptOrderDto } from './dto/update-cash-receipt-order.dto';
import { CashReceiptOrderResponseDto } from './dto/cash-receipt-order-response.dto';
import { DocumentStatus } from '@prisma/client';

@Injectable()
export class CashReceiptOrderService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateCashReceiptOrderDto,
  ): Promise<CashReceiptOrderResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const existing = await this.prisma.cashReceiptOrder.findFirst({
      where: { organizationId, number: createDto.number },
    });

    if (existing) {
      throw new ConflictException('Document with this number already exists');
    }

    const counterpartyId = createDto.counterpartyId && createDto.counterpartyId.trim() !== '' 
      ? createDto.counterpartyId 
      : null;
    const employeeId = createDto.employeeId && createDto.employeeId.trim() !== '' 
      ? createDto.employeeId 
      : null;
    const costItemId = createDto.costItemId && createDto.costItemId.trim() !== '' 
      ? createDto.costItemId 
      : null;
    const description = createDto.description && createDto.description.trim() !== '' 
      ? createDto.description 
      : null;

    const order = await this.prisma.cashReceiptOrder.create({
      data: {
        organizationId,
        number: createDto.number,
        date: createDto.date ? new Date(createDto.date) : new Date(),
        status: DocumentStatus.DRAFT,
        cashRegisterId: createDto.cashRegisterId,
        counterpartyId,
        employeeId,
        costItemId,
        amount: createDto.amount,
        description,
      },
      include: {
        cashRegister: { select: { id: true, name: true } },
        counterparty: { select: { id: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        costItem: { select: { id: true, code: true, name: true } },
      },
    });

    return order as any;
  }

  async findAll(
    userId: string,
    organizationId: string,
    status?: DocumentStatus,
  ): Promise<CashReceiptOrderResponseDto[]> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = { organizationId };
    if (status) where.status = status;

    const orders = await this.prisma.cashReceiptOrder.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        cashRegister: { select: { id: true, name: true } },
        counterparty: { select: { id: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        costItem: { select: { id: true, code: true, name: true } },
      },
    });

    return orders as any;
  }

  async findOne(
    userId: string,
    organizationId: string,
    orderId: string,
  ): Promise<CashReceiptOrderResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const order = await this.prisma.cashReceiptOrder.findFirst({
      where: { id: orderId, organizationId },
      include: {
        cashRegister: { select: { id: true, name: true } },
        counterparty: { select: { id: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        costItem: { select: { id: true, code: true, name: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Cash receipt order not found');
    }

    return order as any;
  }

  async update(
    userId: string,
    organizationId: string,
    orderId: string,
    updateDto: UpdateCashReceiptOrderDto,
  ): Promise<CashReceiptOrderResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const order = await this.findOne(userId, organizationId, orderId);

    if (order.status === DocumentStatus.POSTED) {
      throw new BadRequestException('Cannot update posted document. Cancel it first.');
    }

    if (order.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Cannot update cancelled document');
    }

    const updateData: any = {};

    if (updateDto.number !== undefined) updateData.number = updateDto.number;
    if (updateDto.date !== undefined) {
      updateData.date = updateDto.date ? new Date(updateDto.date) : undefined;
    }
    if (updateDto.cashRegisterId !== undefined) {
      updateData.cashRegisterId = updateDto.cashRegisterId;
    }
    if (updateDto.counterpartyId !== undefined) {
      updateData.counterpartyId = updateDto.counterpartyId && updateDto.counterpartyId.trim() !== '' 
        ? updateDto.counterpartyId 
        : null;
    }
    if (updateDto.employeeId !== undefined) {
      updateData.employeeId = updateDto.employeeId && updateDto.employeeId.trim() !== '' 
        ? updateDto.employeeId 
        : null;
    }
    if (updateDto.costItemId !== undefined) {
      updateData.costItemId = updateDto.costItemId && updateDto.costItemId.trim() !== '' 
        ? updateDto.costItemId 
        : null;
    }
    if (updateDto.amount !== undefined) {
      updateData.amount = updateDto.amount;
    }
    if (updateDto.description !== undefined) {
      updateData.description = updateDto.description && updateDto.description.trim() !== '' 
        ? updateDto.description 
        : null;
    }

    const updated = await this.prisma.cashReceiptOrder.update({
      where: { id: orderId },
      data: updateData,
      include: {
        cashRegister: { select: { id: true, name: true } },
        counterparty: { select: { id: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        costItem: { select: { id: true, code: true, name: true } },
      },
    });

    return updated as any;
  }

  async post(
    userId: string,
    organizationId: string,
    orderId: string,
  ): Promise<CashReceiptOrderResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const order = await this.findOne(userId, organizationId, orderId);

    if (order.status === DocumentStatus.POSTED) {
      throw new BadRequestException('Document is already posted');
    }

    if (order.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Cannot post cancelled document');
    }

    // TODO: Создать проводки
    // Дебет: Касса
    // Кредит: Доходы / Расчеты с контрагентами

    const updated = await this.prisma.cashReceiptOrder.update({
      where: { id: orderId },
      data: { status: DocumentStatus.POSTED },
      include: {
        cashRegister: { select: { id: true, name: true } },
        counterparty: { select: { id: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        costItem: { select: { id: true, code: true, name: true } },
      },
    });

    return updated as any;
  }

  async cancel(
    userId: string,
    organizationId: string,
    orderId: string,
  ): Promise<CashReceiptOrderResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const order = await this.findOne(userId, organizationId, orderId);

    if (order.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Document is already cancelled');
    }

    await this.prisma.transaction.deleteMany({
      where: { cashReceiptOrderId: orderId },
    });

    const updated = await this.prisma.cashReceiptOrder.update({
      where: { id: orderId },
      data: {
        status: DocumentStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: userId,
      },
      include: {
        cashRegister: { select: { id: true, name: true } },
        counterparty: { select: { id: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        costItem: { select: { id: true, code: true, name: true } },
      },
    });

    return updated as any;
  }

  async remove(
    userId: string,
    organizationId: string,
    orderId: string,
  ): Promise<void> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const order = await this.findOne(userId, organizationId, orderId);

    if (order.status === DocumentStatus.POSTED) {
      throw new BadRequestException('Cannot delete posted document. Cancel it first.');
    }

    await this.prisma.cashReceiptOrder.delete({
      where: { id: orderId },
    });
  }
}
