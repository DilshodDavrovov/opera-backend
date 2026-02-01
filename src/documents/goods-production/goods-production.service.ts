import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { CreateGoodsProductionDto } from './dto/create-goods-production.dto';
import { UpdateGoodsProductionDto } from './dto/update-goods-production.dto';
import { GoodsProductionResponseDto } from './dto/goods-production-response.dto';
import { DocumentStatus } from '@prisma/client';

@Injectable()
export class GoodsProductionService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateGoodsProductionDto,
  ): Promise<GoodsProductionResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const existing = await this.prisma.goodsProduction.findFirst({
      where: { organizationId, number: createDto.number },
    });

    if (existing) {
      throw new ConflictException('Document with this number already exists');
    }

    const costItemId = createDto.costItemId && createDto.costItemId.trim() !== '' 
      ? createDto.costItemId 
      : null;
    const employeeId = createDto.employeeId && createDto.employeeId.trim() !== '' 
      ? createDto.employeeId 
      : null;
    const description = createDto.description && createDto.description.trim() !== '' 
      ? createDto.description 
      : null;

    const totalAmount = createDto.items.reduce((sum, item) => {
      const amount = item.amount ?? (item.price ? item.price * item.quantity : 0);
      return sum + amount;
    }, 0);

    const production = await this.prisma.goodsProduction.create({
      data: {
        organizationId,
        number: createDto.number,
        date: createDto.date ? new Date(createDto.date) : new Date(),
        status: DocumentStatus.DRAFT,
        warehouseId: createDto.warehouseId,
        costItemId,
        employeeId,
        description,
        totalAmount: totalAmount > 0 ? totalAmount : null,
        items: {
          create: createDto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price ?? null,
            amount: item.amount ?? (item.price ? item.price * item.quantity : null),
            description: item.description && item.description.trim() !== '' ? item.description : null,
          })),
        },
      },
      include: {
        warehouse: { select: { id: true, name: true } },
        costItem: { select: { id: true, code: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, code: true, name: true, unit: true } },
          },
        },
      },
    });

    return production as any;
  }

  async findAll(
    userId: string,
    organizationId: string,
    status?: DocumentStatus,
  ): Promise<GoodsProductionResponseDto[]> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = { organizationId };
    if (status) where.status = status;

    const productions = await this.prisma.goodsProduction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        warehouse: { select: { id: true, name: true } },
        costItem: { select: { id: true, code: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, code: true, name: true, unit: true } },
          },
        },
      },
    });

    return productions as any;
  }

  async findOne(
    userId: string,
    organizationId: string,
    productionId: string,
  ): Promise<GoodsProductionResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const production = await this.prisma.goodsProduction.findFirst({
      where: { id: productionId, organizationId },
      include: {
        warehouse: { select: { id: true, name: true } },
        costItem: { select: { id: true, code: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, code: true, name: true, unit: true } },
          },
        },
      },
    });

    if (!production) {
      throw new NotFoundException('Goods production not found');
    }

    return production as any;
  }

  async update(
    userId: string,
    organizationId: string,
    productionId: string,
    updateDto: UpdateGoodsProductionDto,
  ): Promise<GoodsProductionResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const production = await this.findOne(userId, organizationId, productionId);

    if (production.status === DocumentStatus.POSTED) {
      throw new BadRequestException('Cannot update posted document. Cancel it first.');
    }

    if (production.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Cannot update cancelled document');
    }

    let totalAmount: number | null = production.totalAmount ?? null;
    if (updateDto.items) {
      totalAmount = updateDto.items.reduce((sum, item) => {
        const amount = item.amount ?? (item.price ? item.price * item.quantity : 0);
        return sum + amount;
      }, 0);
    }

    const updateData: any = {
      totalAmount: totalAmount && totalAmount > 0 ? totalAmount : null,
    };

    if (updateDto.number !== undefined) updateData.number = updateDto.number;
    if (updateDto.date !== undefined) {
      updateData.date = updateDto.date ? new Date(updateDto.date) : undefined;
    }
    if (updateDto.warehouseId !== undefined) {
      updateData.warehouseId = updateDto.warehouseId;
    }
    if (updateDto.costItemId !== undefined) {
      updateData.costItemId = updateDto.costItemId && updateDto.costItemId.trim() !== '' 
        ? updateDto.costItemId 
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
          price: item.price ?? null,
          amount: item.amount ?? (item.price ? item.price * item.quantity : null),
          description: item.description && item.description.trim() !== '' ? item.description : null,
        })),
      };
    }

    const updated = await this.prisma.goodsProduction.update({
      where: { id: productionId },
      data: updateData,
      include: {
        warehouse: { select: { id: true, name: true } },
        costItem: { select: { id: true, code: true, name: true } },
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
    productionId: string,
  ): Promise<GoodsProductionResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const production = await this.findOne(userId, organizationId, productionId);

    if (production.status === DocumentStatus.POSTED) {
      throw new BadRequestException('Document is already posted');
    }

    if (production.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Cannot post cancelled document');
    }

    // TODO: Создать проводки
    // Дебет: Склад (Готовая продукция)
    // Кредит: Производство / Статья затрат

    const updated = await this.prisma.goodsProduction.update({
      where: { id: productionId },
      data: { status: DocumentStatus.POSTED },
      include: {
        warehouse: { select: { id: true, name: true } },
        costItem: { select: { id: true, code: true, name: true } },
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
    productionId: string,
  ): Promise<GoodsProductionResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const production = await this.findOne(userId, organizationId, productionId);

    if (production.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Document is already cancelled');
    }

    await this.prisma.transaction.deleteMany({
      where: { goodsProductionId: productionId },
    });

    const updated = await this.prisma.goodsProduction.update({
      where: { id: productionId },
      data: {
        status: DocumentStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: userId,
      },
      include: {
        warehouse: { select: { id: true, name: true } },
        costItem: { select: { id: true, code: true, name: true } },
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
    productionId: string,
  ): Promise<void> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const production = await this.findOne(userId, organizationId, productionId);

    if (production.status === DocumentStatus.POSTED) {
      throw new BadRequestException('Cannot delete posted document. Cancel it first.');
    }

    await this.prisma.goodsProduction.delete({
      where: { id: productionId },
    });
  }
}
