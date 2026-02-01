import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { CreateGoodsSaleDto } from './dto/create-goods-sale.dto';
import { UpdateGoodsSaleDto } from './dto/update-goods-sale.dto';
import { GoodsSaleResponseDto } from './dto/goods-sale-response.dto';
import { DocumentStatus } from '@prisma/client';

@Injectable()
export class GoodsSaleService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateGoodsSaleDto,
  ): Promise<GoodsSaleResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    // Проверяем уникальность номера документа
    const existing = await this.prisma.goodsSale.findFirst({
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

    // Преобразуем пустые строки в null для опциональных полей
    const contractId = createDto.contractId && createDto.contractId.trim() !== '' 
      ? createDto.contractId 
      : null;
    const employeeId = createDto.employeeId && createDto.employeeId.trim() !== '' 
      ? createDto.employeeId 
      : null;
    const description = createDto.description && createDto.description.trim() !== '' 
      ? createDto.description 
      : null;

    // Вычисляем общую сумму из позиций
    const totalAmount = createDto.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    // Создаем документ с позициями
    const goodsSale = await this.prisma.goodsSale.create({
      data: {
        organizationId,
        number: createDto.number,
        date: createDto.date ? new Date(createDto.date) : new Date(),
        status: DocumentStatus.DRAFT,
        counterpartyId: createDto.counterpartyId,
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

    return goodsSale as any;
  }

  async findAll(
    userId: string,
    organizationId: string,
    status?: DocumentStatus,
  ): Promise<GoodsSaleResponseDto[]> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = { organizationId };
    if (status) where.status = status;

    const sales = await this.prisma.goodsSale.findMany({
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

    return sales as any;
  }

  async findOne(
    userId: string,
    organizationId: string,
    saleId: string,
  ): Promise<GoodsSaleResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const sale = await this.prisma.goodsSale.findFirst({
      where: {
        id: saleId,
        organizationId,
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

    if (!sale) {
      throw new NotFoundException('Goods sale not found');
    }

    return sale as any;
  }

  async update(
    userId: string,
    organizationId: string,
    saleId: string,
    updateDto: UpdateGoodsSaleDto,
  ): Promise<GoodsSaleResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const sale = await this.findOne(userId, organizationId, saleId);

    if (sale.status === DocumentStatus.POSTED) {
      throw new BadRequestException(
        'Cannot update posted document. Cancel it first.',
      );
    }

    if (sale.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Cannot update cancelled document');
    }

    // Если обновляются позиции, пересчитываем сумму
    let totalAmount = sale.totalAmount;
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

    const updated = await this.prisma.goodsSale.update({
      where: { id: saleId },
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
    saleId: string,
  ): Promise<GoodsSaleResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const sale = await this.findOne(userId, organizationId, saleId);

    if (sale.status === DocumentStatus.POSTED) {
      throw new BadRequestException('Document is already posted');
    }

    if (sale.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Cannot post cancelled document');
    }

    // TODO: Создать проводки на основе документа
    // Дебет: Расчеты с покупателями
    // Кредит: Реализация (Доходы)

    const updated = await this.prisma.goodsSale.update({
      where: { id: saleId },
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
    saleId: string,
  ): Promise<GoodsSaleResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const sale = await this.findOne(userId, organizationId, saleId);

    if (sale.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Document is already cancelled');
    }

    // Удаляем связанные проводки
    await this.prisma.transaction.deleteMany({
      where: { goodsSaleId: saleId },
    });

    const updated = await this.prisma.goodsSale.update({
      where: { id: saleId },
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
    saleId: string,
  ): Promise<void> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const sale = await this.findOne(userId, organizationId, saleId);

    if (sale.status === DocumentStatus.POSTED) {
      throw new BadRequestException(
        'Cannot delete posted document. Cancel it first.',
      );
    }

    await this.prisma.goodsSale.delete({
      where: { id: saleId },
    });
  }
}
