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
import { CashExpenseOrderService } from './cash-expense-order.service';
import { CreateCashExpenseOrderDto } from './dto/create-cash-expense-order.dto';
import { UpdateCashExpenseOrderDto } from './dto/update-cash-expense-order.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';
import { DocumentStatus } from '@prisma/client';

@Controller('organizations/:organizationId/documents/cash-expense-order')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class CashExpenseOrderController {
  constructor(private cashExpenseOrderService: CashExpenseOrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateCashExpenseOrderDto,
  ) {
    return this.cashExpenseOrderService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('status') status?: DocumentStatus,
  ) {
    return this.cashExpenseOrderService.findAll(user.id, organizationId, status);
  }

  @Get(':orderId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.cashExpenseOrderService.findOne(user.id, organizationId, orderId);
  }

  @Patch(':orderId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('orderId') orderId: string,
    @Body() updateDto: UpdateCashExpenseOrderDto,
  ) {
    return this.cashExpenseOrderService.update(
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
    return this.cashExpenseOrderService.post(user.id, organizationId, orderId);
  }

  @Post(':orderId/cancel')
  async cancel(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.cashExpenseOrderService.cancel(user.id, organizationId, orderId);
  }

  @Delete(':orderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('orderId') orderId: string,
  ) {
    await this.cashExpenseOrderService.remove(user.id, organizationId, orderId);
  }
}
