import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { CreateCostItemDto } from './dto/create-cost-item.dto';
import { UpdateCostItemDto } from './dto/update-cost-item.dto';
import { CostItemResponseDto } from './dto/cost-item-response.dto';

@Injectable()
export class CostItemsService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateCostItemDto,
  ): Promise<CostItemResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    // Проверяем уникальность кода
    const existing = await this.prisma.costItem.findFirst({
      where: {
        organizationId,
        code: createDto.code,
      },
    });

    if (existing) {
      throw new ConflictException('Cost item with this code already exists');
    }

    const costItem = await this.prisma.costItem.create({
      data: {
        organizationId,
        code: createDto.code,
        name: createDto.name,
        isActive: createDto.isActive ?? true,
      },
    });

    return costItem as CostItemResponseDto;
  }

  async findAll(
    userId: string,
    organizationId: string,
    includeInactive = false,
  ): Promise<CostItemResponseDto[]> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = { organizationId };
    if (!includeInactive) {
      where.isActive = true;
    }

    const costItems = await this.prisma.costItem.findMany({
      where,
      orderBy: { code: 'asc' },
    });

    return costItems as CostItemResponseDto[];
  }

  async findOne(
    userId: string,
    organizationId: string,
    costItemId: string,
  ): Promise<CostItemResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const costItem = await this.prisma.costItem.findFirst({
      where: {
        id: costItemId,
        organizationId,
      },
    });

    if (!costItem) {
      throw new NotFoundException('Cost item not found');
    }

    return costItem as CostItemResponseDto;
  }

  async update(
    userId: string,
    organizationId: string,
    costItemId: string,
    updateDto: UpdateCostItemDto,
  ): Promise<CostItemResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const costItem = await this.findOne(userId, organizationId, costItemId);

    // Если обновляется код, проверяем уникальность
    if (updateDto.code && updateDto.code !== costItem.code) {
      const existing = await this.prisma.costItem.findFirst({
        where: {
          organizationId,
          code: updateDto.code,
        },
      });

      if (existing) {
        throw new ConflictException('Cost item with this code already exists');
      }
    }

    const updated = await this.prisma.costItem.update({
      where: { id: costItemId },
      data: updateDto,
    });

    return updated as CostItemResponseDto;
  }

  async remove(
    userId: string,
    organizationId: string,
    costItemId: string,
  ): Promise<void> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const costItem = await this.findOne(userId, organizationId, costItemId);

    // Проверяем, используется ли статья затрат в документах
    const [writeOffsCount, productionsCount, receiptOrdersCount, expenseOrdersCount] =
      await Promise.all([
        this.prisma.goodsWriteOff.count({
          where: { costItemId },
        }),
        this.prisma.goodsProduction.count({
          where: { costItemId },
        }),
        this.prisma.cashReceiptOrder.count({
          where: { costItemId },
        }),
        this.prisma.cashExpenseOrder.count({
          where: { costItemId },
        }),
      ]);

    if (
      writeOffsCount > 0 ||
      productionsCount > 0 ||
      receiptOrdersCount > 0 ||
      expenseOrdersCount > 0
    ) {
      throw new BadRequestException(
        'Cannot delete cost item: it is used in documents',
      );
    }

    await this.prisma.costItem.delete({
      where: { id: costItemId },
    });
  }
}
