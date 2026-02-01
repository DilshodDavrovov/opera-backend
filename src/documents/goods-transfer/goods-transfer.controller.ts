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
import { GoodsTransferService } from './goods-transfer.service';
import { CreateGoodsTransferDto } from './dto/create-goods-transfer.dto';
import { UpdateGoodsTransferDto } from './dto/update-goods-transfer.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';
import { DocumentStatus } from '@prisma/client';

@Controller('organizations/:organizationId/documents/goods-transfer')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class GoodsTransferController {
  constructor(private goodsTransferService: GoodsTransferService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateGoodsTransferDto,
  ) {
    return this.goodsTransferService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('status') status?: DocumentStatus,
  ) {
    return this.goodsTransferService.findAll(user.id, organizationId, status);
  }

  @Get(':transferId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('transferId') transferId: string,
  ) {
    return this.goodsTransferService.findOne(user.id, organizationId, transferId);
  }

  @Patch(':transferId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('transferId') transferId: string,
    @Body() updateDto: UpdateGoodsTransferDto,
  ) {
    return this.goodsTransferService.update(
      user.id,
      organizationId,
      transferId,
      updateDto,
    );
  }

  @Post(':transferId/post')
  async post(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('transferId') transferId: string,
  ) {
    return this.goodsTransferService.post(user.id, organizationId, transferId);
  }

  @Post(':transferId/cancel')
  async cancel(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('transferId') transferId: string,
  ) {
    return this.goodsTransferService.cancel(user.id, organizationId, transferId);
  }

  @Delete(':transferId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('transferId') transferId: string,
  ) {
    await this.goodsTransferService.remove(user.id, organizationId, transferId);
  }
}
