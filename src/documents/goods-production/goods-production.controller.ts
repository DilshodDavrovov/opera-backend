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
import { GoodsProductionService } from './goods-production.service';
import { CreateGoodsProductionDto } from './dto/create-goods-production.dto';
import { UpdateGoodsProductionDto } from './dto/update-goods-production.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';
import { DocumentStatus } from '@prisma/client';

@Controller('organizations/:organizationId/documents/goods-production')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class GoodsProductionController {
  constructor(private goodsProductionService: GoodsProductionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateGoodsProductionDto,
  ) {
    return this.goodsProductionService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('status') status?: DocumentStatus,
  ) {
    return this.goodsProductionService.findAll(user.id, organizationId, status);
  }

  @Get(':productionId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('productionId') productionId: string,
  ) {
    return this.goodsProductionService.findOne(user.id, organizationId, productionId);
  }

  @Patch(':productionId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('productionId') productionId: string,
    @Body() updateDto: UpdateGoodsProductionDto,
  ) {
    return this.goodsProductionService.update(
      user.id,
      organizationId,
      productionId,
      updateDto,
    );
  }

  @Post(':productionId/post')
  async post(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('productionId') productionId: string,
  ) {
    return this.goodsProductionService.post(user.id, organizationId, productionId);
  }

  @Post(':productionId/cancel')
  async cancel(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('productionId') productionId: string,
  ) {
    return this.goodsProductionService.cancel(user.id, organizationId, productionId);
  }

  @Delete(':productionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('productionId') productionId: string,
  ) {
    await this.goodsProductionService.remove(user.id, organizationId, productionId);
  }
}
