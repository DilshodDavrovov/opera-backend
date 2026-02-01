import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseResponseDto } from './dto/warehouse-response.dto';

@Injectable()
export class WarehousesService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateWarehouseDto,
  ): Promise<WarehouseResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const warehouse = await this.prisma.warehouse.create({
      data: {
        organizationId,
        name: createDto.name,
        address: createDto.address,
        isActive: createDto.isActive ?? true,
      },
    });

    return warehouse as WarehouseResponseDto;
  }

  async findAll(
    userId: string,
    organizationId: string,
    includeInactive = false,
  ): Promise<WarehouseResponseDto[]> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = { organizationId };
    if (!includeInactive) {
      where.isActive = true;
    }

    return (await this.prisma.warehouse.findMany({
      where,
      orderBy: { name: 'asc' },
    })) as WarehouseResponseDto[];
  }

  async findOne(
    userId: string,
    organizationId: string,
    warehouseId: string,
  ): Promise<WarehouseResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: warehouseId, organizationId },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    return warehouse as WarehouseResponseDto;
  }

  async update(
    userId: string,
    organizationId: string,
    warehouseId: string,
    updateDto: UpdateWarehouseDto,
  ): Promise<WarehouseResponseDto> {
    await this.findOne(userId, organizationId, warehouseId);

    return (await this.prisma.warehouse.update({
      where: { id: warehouseId },
      data: updateDto,
    })) as WarehouseResponseDto;
  }

  async remove(
    userId: string,
    organizationId: string,
    warehouseId: string,
  ): Promise<void> {
    await this.findOne(userId, organizationId, warehouseId);
    await this.prisma.warehouse.delete({ where: { id: warehouseId } });
  }
}
