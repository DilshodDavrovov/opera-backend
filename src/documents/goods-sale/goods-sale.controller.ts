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
import { GoodsSaleService } from './goods-sale.service';
import { CreateGoodsSaleDto } from './dto/create-goods-sale.dto';
import { UpdateGoodsSaleDto } from './dto/update-goods-sale.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';
import { DocumentStatus } from '@prisma/client';

@Controller('organizations/:organizationId/documents/goods-sale')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class GoodsSaleController {
  constructor(private goodsSaleService: GoodsSaleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateGoodsSaleDto,
  ) {
    return this.goodsSaleService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('status') status?: DocumentStatus,
  ) {
    return this.goodsSaleService.findAll(user.id, organizationId, status);
  }

  @Get(':saleId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('saleId') saleId: string,
  ) {
    return this.goodsSaleService.findOne(user.id, organizationId, saleId);
  }

  @Patch(':saleId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('saleId') saleId: string,
    @Body() updateDto: UpdateGoodsSaleDto,
  ) {
    return this.goodsSaleService.update(
      user.id,
      organizationId,
      saleId,
      updateDto,
    );
  }

  @Post(':saleId/post')
  async post(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('saleId') saleId: string,
  ) {
    return this.goodsSaleService.post(user.id, organizationId, saleId);
  }

  @Post(':saleId/cancel')
  async cancel(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('saleId') saleId: string,
  ) {
    return this.goodsSaleService.cancel(user.id, organizationId, saleId);
  }

  @Delete(':saleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('saleId') saleId: string,
  ) {
    await this.goodsSaleService.remove(user.id, organizationId, saleId);
  }
}
