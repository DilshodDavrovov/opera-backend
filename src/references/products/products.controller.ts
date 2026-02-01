import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';

@Controller('organizations/:organizationId/references/products')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateProductDto,
  ) {
    return this.productsService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.productsService.findAll(
      user.id,
      organizationId,
      includeInactive === 'true',
    );
  }

  @Get(':productId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('productId') productId: string,
  ) {
    return this.productsService.findOne(user.id, organizationId, productId);
  }

  @Patch(':productId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('productId') productId: string,
    @Body() updateDto: UpdateProductDto,
  ) {
    return this.productsService.update(
      user.id,
      organizationId,
      productId,
      updateDto,
    );
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('productId') productId: string,
  ) {
    await this.productsService.remove(user.id, organizationId, productId);
  }
}
