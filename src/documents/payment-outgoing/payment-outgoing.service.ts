import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { CreatePaymentOutgoingDto } from './dto/create-payment-outgoing.dto';
import { UpdatePaymentOutgoingDto } from './dto/update-payment-outgoing.dto';
import { PaymentOutgoingResponseDto } from './dto/payment-outgoing-response.dto';
import { DocumentStatus } from '@prisma/client';

@Injectable()
export class PaymentOutgoingService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreatePaymentOutgoingDto,
  ): Promise<PaymentOutgoingResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const existing = await this.prisma.paymentOutgoing.findFirst({
      where: { organizationId, number: createDto.number },
    });

    if (existing) {
      throw new ConflictException('Document with this number already exists');
    }

    const contractId = createDto.contractId && createDto.contractId.trim() !== '' 
      ? createDto.contractId 
      : null;
    const description = createDto.description && createDto.description.trim() !== '' 
      ? createDto.description 
      : null;

    const payment = await this.prisma.paymentOutgoing.create({
      data: {
        organizationId,
        number: createDto.number,
        date: createDto.date ? new Date(createDto.date) : new Date(),
        status: DocumentStatus.DRAFT,
        bankAccountId: createDto.bankAccountId,
        counterpartyId: createDto.counterpartyId,
        contractId,
        amount: createDto.amount,
        description,
      },
      include: {
        bankAccount: { select: { id: true, name: true, accountNumber: true } },
        counterparty: { select: { id: true, name: true } },
        contract: { select: { id: true, number: true } },
      },
    });

    return payment as any;
  }

  async findAll(
    userId: string,
    organizationId: string,
    status?: DocumentStatus,
  ): Promise<PaymentOutgoingResponseDto[]> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = { organizationId };
    if (status) where.status = status;

    const payments = await this.prisma.paymentOutgoing.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        bankAccount: { select: { id: true, name: true, accountNumber: true } },
        counterparty: { select: { id: true, name: true } },
        contract: { select: { id: true, number: true } },
      },
    });

    return payments as any;
  }

  async findOne(
    userId: string,
    organizationId: string,
    paymentId: string,
  ): Promise<PaymentOutgoingResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const payment = await this.prisma.paymentOutgoing.findFirst({
      where: { id: paymentId, organizationId },
      include: {
        bankAccount: { select: { id: true, name: true, accountNumber: true } },
        counterparty: { select: { id: true, name: true } },
        contract: { select: { id: true, number: true } },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment outgoing not found');
    }

    return payment as any;
  }

  async update(
    userId: string,
    organizationId: string,
    paymentId: string,
    updateDto: UpdatePaymentOutgoingDto,
  ): Promise<PaymentOutgoingResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const payment = await this.findOne(userId, organizationId, paymentId);

    if (payment.status === DocumentStatus.POSTED) {
      throw new BadRequestException('Cannot update posted document. Cancel it first.');
    }

    if (payment.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Cannot update cancelled document');
    }

    const updateData: any = {};

    if (updateDto.number !== undefined) updateData.number = updateDto.number;
    if (updateDto.date !== undefined) {
      updateData.date = updateDto.date ? new Date(updateDto.date) : undefined;
    }
    if (updateDto.bankAccountId !== undefined) {
      updateData.bankAccountId = updateDto.bankAccountId;
    }
    if (updateDto.counterpartyId !== undefined) {
      updateData.counterpartyId = updateDto.counterpartyId;
    }
    if (updateDto.contractId !== undefined) {
      updateData.contractId = updateDto.contractId && updateDto.contractId.trim() !== '' 
        ? updateDto.contractId 
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

    const updated = await this.prisma.paymentOutgoing.update({
      where: { id: paymentId },
      data: updateData,
      include: {
        bankAccount: { select: { id: true, name: true, accountNumber: true } },
        counterparty: { select: { id: true, name: true } },
        contract: { select: { id: true, number: true } },
      },
    });

    return updated as any;
  }

  async post(
    userId: string,
    organizationId: string,
    paymentId: string,
  ): Promise<PaymentOutgoingResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const payment = await this.findOne(userId, organizationId, paymentId);

    if (payment.status === DocumentStatus.POSTED) {
      throw new BadRequestException('Document is already posted');
    }

    if (payment.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Cannot post cancelled document');
    }

    // TODO: Создать проводки
    // Дебет: Расчеты с контрагентами / Расходы
    // Кредит: Банковский счет

    const updated = await this.prisma.paymentOutgoing.update({
      where: { id: paymentId },
      data: { status: DocumentStatus.POSTED },
      include: {
        bankAccount: { select: { id: true, name: true, accountNumber: true } },
        counterparty: { select: { id: true, name: true } },
        contract: { select: { id: true, number: true } },
      },
    });

    return updated as any;
  }

  async cancel(
    userId: string,
    organizationId: string,
    paymentId: string,
  ): Promise<PaymentOutgoingResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const payment = await this.findOne(userId, organizationId, paymentId);

    if (payment.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Document is already cancelled');
    }

    await this.prisma.transaction.deleteMany({
      where: { paymentOutgoingId: paymentId },
    });

    const updated = await this.prisma.paymentOutgoing.update({
      where: { id: paymentId },
      data: {
        status: DocumentStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: userId,
      },
      include: {
        bankAccount: { select: { id: true, name: true, accountNumber: true } },
        counterparty: { select: { id: true, name: true } },
        contract: { select: { id: true, number: true } },
      },
    });

    return updated as any;
  }

  async remove(
    userId: string,
    organizationId: string,
    paymentId: string,
  ): Promise<void> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const payment = await this.findOne(userId, organizationId, paymentId);

    if (payment.status === DocumentStatus.POSTED) {
      throw new BadRequestException('Cannot delete posted document. Cancel it first.');
    }

    await this.prisma.paymentOutgoing.delete({
      where: { id: paymentId },
    });
  }
}
