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
import { GoodsReceiptService } from './goods-receipt.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { UpdateGoodsReceiptDto } from './dto/update-goods-receipt.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';
import { DocumentStatus } from '@prisma/client';

@Controller('organizations/:organizationId/documents/goods-receipt')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class GoodsReceiptController {
  constructor(private goodsReceiptService: GoodsReceiptService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateGoodsReceiptDto,
  ) {
    return this.goodsReceiptService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('status') status?: DocumentStatus,
  ) {
    return this.goodsReceiptService.findAll(user.id, organizationId, status);
  }

  @Get(':receiptId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('receiptId') receiptId: string,
  ) {
    return this.goodsReceiptService.findOne(user.id, organizationId, receiptId);
  }

  @Patch(':receiptId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('receiptId') receiptId: string,
    @Body() updateDto: UpdateGoodsReceiptDto,
  ) {
    return this.goodsReceiptService.update(
      user.id,
      organizationId,
      receiptId,
      updateDto,
    );
  }

  @Post(':receiptId/post')
  async post(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('receiptId') receiptId: string,
  ) {
    return this.goodsReceiptService.post(user.id, organizationId, receiptId);
  }

  @Post(':receiptId/cancel')
  async cancel(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('receiptId') receiptId: string,
  ) {
    return this.goodsReceiptService.cancel(user.id, organizationId, receiptId);
  }

  @Delete(':receiptId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('receiptId') receiptId: string,
  ) {
    await this.goodsReceiptService.remove(user.id, organizationId, receiptId);
  }
}
