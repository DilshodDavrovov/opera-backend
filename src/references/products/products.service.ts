import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const existing = await this.prisma.product.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: createDto.code,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Product with this code already exists in this organization',
      );
    }

    const product = await this.prisma.product.create({
      data: {
        organizationId,
        code: createDto.code,
        name: createDto.name,
        unit: createDto.unit,
        description: createDto.description,
        isActive: createDto.isActive ?? true,
      },
    });

    return product as ProductResponseDto;
  }

  async findAll(
    userId: string,
    organizationId: string,
    includeInactive = false,
  ): Promise<ProductResponseDto[]> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = { organizationId };
    if (!includeInactive) {
      where.isActive = true;
    }

    return (await this.prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    })) as ProductResponseDto[];
  }

  async findOne(
    userId: string,
    organizationId: string,
    productId: string,
  ): Promise<ProductResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const product = await this.prisma.product.findFirst({
      where: { id: productId, organizationId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product as ProductResponseDto;
  }

  async update(
    userId: string,
    organizationId: string,
    productId: string,
    updateDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    await this.findOne(userId, organizationId, productId);

    return (await this.prisma.product.update({
      where: { id: productId },
      data: updateDto,
    })) as ProductResponseDto;
  }

  async remove(
    userId: string,
    organizationId: string,
    productId: string,
  ): Promise<void> {
    await this.findOne(userId, organizationId, productId);
    await this.prisma.product.delete({ where: { id: productId } });
  }
}
