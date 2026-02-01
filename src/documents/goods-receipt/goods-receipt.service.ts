import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { UpdateGoodsReceiptDto } from './dto/update-goods-receipt.dto';
import { GoodsReceiptResponseDto } from './dto/goods-receipt-response.dto';
import { DocumentStatus } from '@prisma/client';

@Injectable()
export class GoodsReceiptService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateGoodsReceiptDto,
  ): Promise<GoodsReceiptResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    // Проверяем уникальность номера документа
    const existing = await this.prisma.goodsReceipt.findFirst({
      where: {
        organizationId,
        number: createDto.number,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Document with this number already exists',
      );
    }

    // Вычисляем общую сумму из позиций
    const totalAmount = createDto.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    // Преобразуем пустые строки в null для опциональных полей
    const counterpartyId = createDto.counterpartyId && createDto.counterpartyId.trim() !== '' 
      ? createDto.counterpartyId 
      : null;
    const contractId = createDto.contractId && createDto.contractId.trim() !== '' 
      ? createDto.contractId 
      : null;
    const employeeId = createDto.employeeId && createDto.employeeId.trim() !== '' 
      ? createDto.employeeId 
      : null;
    const description = createDto.description && createDto.description.trim() !== '' 
      ? createDto.description 
      : null;

    // Создаем документ с позициями
    const goodsReceipt = await this.prisma.goodsReceipt.create({
      data: {
        organizationId,
        number: createDto.number,
        date: createDto.date ? new Date(createDto.date) : new Date(),
        status: DocumentStatus.DRAFT,
        counterpartyId,
        warehouseId: createDto.warehouseId,
        contractId,
        employeeId,
        description,
        totalAmount,
        items: {
          create: createDto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            amount: item.quantity * item.price,
            description: item.description && item.description.trim() !== '' ? item.description : null,
          })),
        },
      },
      include: {
        counterparty: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        contract: { select: { id: true, number: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, code: true, name: true, unit: true } },
          },
        },
      },
    });

    return goodsReceipt as any;
  }

  async findAll(
    userId: string,
    organizationId: string,
    status?: DocumentStatus,
  ): Promise<GoodsReceiptResponseDto[]> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = { organizationId };
    if (status) where.status = status;

    const receipts = await this.prisma.goodsReceipt.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        counterparty: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        contract: { select: { id: true, number: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, code: true, name: true, unit: true } },
          },
        },
      },
    });

    return receipts as any;
  }

  async findOne(
    userId: string,
    organizationId: string,
    receiptId: string,
  ): Promise<GoodsReceiptResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const receipt = await this.prisma.goodsReceipt.findFirst({
      where: {
        id: receiptId,
        organizationId,
      },
      include: {
        counterparty: true,
        warehouse: true,
        contract: true,
        employee: true,
        items: {
          include: {
            product: true,
          },
        },
        transactions: true,
      },
    });

    if (!receipt) {
      throw new NotFoundException('Goods receipt not found');
    }

    return receipt as any;
  }

  async update(
    userId: string,
    organizationId: string,
    receiptId: string,
    updateDto: UpdateGoodsReceiptDto,
  ): Promise<GoodsReceiptResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const receipt = await this.findOne(userId, organizationId, receiptId);

    if (receipt.status === DocumentStatus.POSTED) {
      throw new BadRequestException(
        'Cannot update posted document. Cancel it first.',
      );
    }

    if (receipt.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Cannot update cancelled document');
    }

    // Если обновляются позиции, пересчитываем сумму
    let totalAmount = receipt.totalAmount;
    if (updateDto.items) {
      totalAmount = updateDto.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );
    }

    // Обновляем документ
    const updateData: any = {
      totalAmount,
    };

    // Преобразуем пустые строки в null для опциональных полей
    if (updateDto.number !== undefined) {
      updateData.number = updateDto.number;
    }
    if (updateDto.date !== undefined) {
      updateData.date = updateDto.date ? new Date(updateDto.date) : undefined;
    }
    if (updateDto.counterpartyId !== undefined) {
      updateData.counterpartyId = updateDto.counterpartyId && updateDto.counterpartyId.trim() !== '' 
        ? updateDto.counterpartyId 
        : null;
    }
    if (updateDto.warehouseId !== undefined) {
      updateData.warehouseId = updateDto.warehouseId;
    }
    if (updateDto.contractId !== undefined) {
      updateData.contractId = updateDto.contractId && updateDto.contractId.trim() !== '' 
        ? updateDto.contractId 
        : null;
    }
    if (updateDto.employeeId !== undefined) {
      updateData.employeeId = updateDto.employeeId && updateDto.employeeId.trim() !== '' 
        ? updateDto.employeeId 
        : null;
    }
    if (updateDto.description !== undefined) {
      updateData.description = updateDto.description && updateDto.description.trim() !== '' 
        ? updateDto.description 
        : null;
    }

    if (updateDto.items) {
      updateData.items = {
        deleteMany: {},
        create: updateDto.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          amount: item.quantity * item.price,
          description: item.description && item.description.trim() !== '' ? item.description : null,
        })),
      };
    }

    const updated = await this.prisma.goodsReceipt.update({
      where: { id: receiptId },
      data: updateData,
      include: {
        counterparty: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        contract: { select: { id: true, number: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, code: true, name: true, unit: true } },
          },
        },
      },
    });

    return updated as any;
  }

  async post(
    userId: string,
    organizationId: string,
    receiptId: string,
  ): Promise<GoodsReceiptResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const receipt = await this.findOne(userId, organizationId, receiptId);

    if (receipt.status === DocumentStatus.POSTED) {
      throw new BadRequestException('Document is already posted');
    }

    if (receipt.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Cannot post cancelled document');
    }

    // TODO: Создать проводки на основе документа
    // Дебет: Склад (Товары на складе)
    // Кредит: Расчеты с поставщиком

    const updated = await this.prisma.goodsReceipt.update({
      where: { id: receiptId },
      data: { status: DocumentStatus.POSTED },
      include: {
        counterparty: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        contract: { select: { id: true, number: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, code: true, name: true, unit: true } },
          },
        },
      },
    });

    return updated as any;
  }

  async cancel(
    userId: string,
    organizationId: string,
    receiptId: string,
  ): Promise<GoodsReceiptResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const receipt = await this.findOne(userId, organizationId, receiptId);

    if (receipt.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Document is already cancelled');
    }

    // Удаляем связанные проводки
    await this.prisma.transaction.deleteMany({
      where: { goodsReceiptId: receiptId },
    });

    const updated = await this.prisma.goodsReceipt.update({
      where: { id: receiptId },
      data: {
        status: DocumentStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: userId,
      },
      include: {
        counterparty: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        contract: { select: { id: true, number: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, code: true, name: true, unit: true } },
          },
        },
      },
    });

    return updated as any;
  }

  async remove(
    userId: string,
    organizationId: string,
    receiptId: string,
  ): Promise<void> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const receipt = await this.findOne(userId, organizationId, receiptId);

    if (receipt.status !== DocumentStatus.DRAFT) {
      throw new BadRequestException(
        'Can only delete draft documents. Cancel posted documents first.',
      );
    }

    await this.prisma.goodsReceipt.delete({
      where: { id: receiptId },
    });
  }
}
