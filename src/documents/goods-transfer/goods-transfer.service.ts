import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { CreateGoodsTransferDto } from './dto/create-goods-transfer.dto';
import { UpdateGoodsTransferDto } from './dto/update-goods-transfer.dto';
import { GoodsTransferResponseDto } from './dto/goods-transfer-response.dto';
import { DocumentStatus } from '@prisma/client';

@Injectable()
export class GoodsTransferService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateGoodsTransferDto,
  ): Promise<GoodsTransferResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const existing = await this.prisma.goodsTransfer.findFirst({
      where: { organizationId, number: createDto.number },
    });

    if (existing) {
      throw new ConflictException('Document with this number already exists');
    }

    const employeeId = createDto.employeeId && createDto.employeeId.trim() !== '' 
      ? createDto.employeeId 
      : null;
    const description = createDto.description && createDto.description.trim() !== '' 
      ? createDto.description 
      : null;

    const transfer = await this.prisma.goodsTransfer.create({
      data: {
        organizationId,
        number: createDto.number,
        date: createDto.date ? new Date(createDto.date) : new Date(),
        status: DocumentStatus.DRAFT,
        warehouseFromId: createDto.warehouseFromId,
        warehouseToId: createDto.warehouseToId,
        employeeId,
        description,
        items: {
          create: createDto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            description: item.description && item.description.trim() !== '' ? item.description : null,
          })),
        },
      },
      include: {
        warehouseFrom: { select: { id: true, name: true } },
        warehouseTo: { select: { id: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, code: true, name: true, unit: true } },
          },
        },
      },
    });

    return transfer as any;
  }

  async findAll(
    userId: string,
    organizationId: string,
    status?: DocumentStatus,
  ): Promise<GoodsTransferResponseDto[]> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = { organizationId };
    if (status) where.status = status;

    const transfers = await this.prisma.goodsTransfer.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        warehouseFrom: { select: { id: true, name: true } },
        warehouseTo: { select: { id: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, code: true, name: true, unit: true } },
          },
        },
      },
    });

    return transfers as any;
  }

  async findOne(
    userId: string,
    organizationId: string,
    transferId: string,
  ): Promise<GoodsTransferResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const transfer = await this.prisma.goodsTransfer.findFirst({
      where: { id: transferId, organizationId },
      include: {
        warehouseFrom: { select: { id: true, name: true } },
        warehouseTo: { select: { id: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, code: true, name: true, unit: true } },
          },
        },
      },
    });

    if (!transfer) {
      throw new NotFoundException('Goods transfer not found');
    }

    return transfer as any;
  }

  async update(
    userId: string,
    organizationId: string,
    transferId: string,
    updateDto: UpdateGoodsTransferDto,
  ): Promise<GoodsTransferResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const transfer = await this.findOne(userId, organizationId, transferId);

    if (transfer.status === DocumentStatus.POSTED) {
      throw new BadRequestException('Cannot update posted document. Cancel it first.');
    }

    if (transfer.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Cannot update cancelled document');
    }

    const updateData: any = {};

    if (updateDto.number !== undefined) updateData.number = updateDto.number;
    if (updateDto.date !== undefined) {
      updateData.date = updateDto.date ? new Date(updateDto.date) : undefined;
    }
    if (updateDto.warehouseFromId !== undefined) {
      updateData.warehouseFromId = updateDto.warehouseFromId;
    }
    if (updateDto.warehouseToId !== undefined) {
      updateData.warehouseToId = updateDto.warehouseToId;
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
          description: item.description && item.description.trim() !== '' ? item.description : null,
        })),
      };
    }

    const updated = await this.prisma.goodsTransfer.update({
      where: { id: transferId },
      data: updateData,
      include: {
        warehouseFrom: { select: { id: true, name: true } },
        warehouseTo: { select: { id: true, name: true } },
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
    transferId: string,
  ): Promise<GoodsTransferResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const transfer = await this.findOne(userId, organizationId, transferId);

    if (transfer.status === DocumentStatus.POSTED) {
      throw new BadRequestException('Document is already posted');
    }

    if (transfer.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Cannot post cancelled document');
    }

    // TODO: Создать проводки
    // Дебет: Склад назначения
    // Кредит: Склад отправления

    const updated = await this.prisma.goodsTransfer.update({
      where: { id: transferId },
      data: { status: DocumentStatus.POSTED },
      include: {
        warehouseFrom: { select: { id: true, name: true } },
        warehouseTo: { select: { id: true, name: true } },
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
    transferId: string,
  ): Promise<GoodsTransferResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const transfer = await this.findOne(userId, organizationId, transferId);

    if (transfer.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Document is already cancelled');
    }

    await this.prisma.transaction.deleteMany({
      where: { goodsTransferId: transferId },
    });

    const updated = await this.prisma.goodsTransfer.update({
      where: { id: transferId },
      data: {
        status: DocumentStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: userId,
      },
      include: {
        warehouseFrom: { select: { id: true, name: true } },
        warehouseTo: { select: { id: true, name: true } },
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
    transferId: string,
  ): Promise<void> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const transfer = await this.findOne(userId, organizationId, transferId);

    if (transfer.status === DocumentStatus.POSTED) {
      throw new BadRequestException('Cannot delete posted document. Cancel it first.');
    }

    await this.prisma.goodsTransfer.delete({
      where: { id: transferId },
    });
  }
}
