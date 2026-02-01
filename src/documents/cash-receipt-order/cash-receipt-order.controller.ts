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
import { CashReceiptOrderService } from './cash-receipt-order.service';
import { CreateCashReceiptOrderDto } from './dto/create-cash-receipt-order.dto';
import { UpdateCashReceiptOrderDto } from './dto/update-cash-receipt-order.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';
import { DocumentStatus } from '@prisma/client';

@Controller('organizations/:organizationId/documents/cash-receipt-order')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class CashReceiptOrderController {
  constructor(private cashReceiptOrderService: CashReceiptOrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateCashReceiptOrderDto,
  ) {
    return this.cashReceiptOrderService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('status') status?: DocumentStatus,
  ) {
    return this.cashReceiptOrderService.findAll(user.id, organizationId, status);
  }

  @Get(':orderId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.cashReceiptOrderService.findOne(user.id, organizationId, orderId);
  }

  @Patch(':orderId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('orderId') orderId: string,
    @Body() updateDto: UpdateCashReceiptOrderDto,
  ) {
    return this.cashReceiptOrderService.update(
      user.id,
      organizationId,
      orderId,
      updateDto,
    );
  }

  @Post(':orderId/post')
  async post(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.cashReceiptOrderService.post(user.id, organizationId, orderId);
  }

  @Post(':orderId/cancel')
  async cancel(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.cashReceiptOrderService.cancel(user.id, organizationId, orderId);
  }

  @Delete(':orderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('orderId') orderId: string,
  ) {
    await this.cashReceiptOrderService.remove(user.id, organizationId, orderId);
  }
}
