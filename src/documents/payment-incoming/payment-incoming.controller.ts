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
import { PaymentIncomingService } from './payment-incoming.service';
import { CreatePaymentIncomingDto } from './dto/create-payment-incoming.dto';
import { UpdatePaymentIncomingDto } from './dto/update-payment-incoming.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';
import { DocumentStatus } from '@prisma/client';

@Controller('organizations/:organizationId/documents/payment-incoming')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class PaymentIncomingController {
  constructor(private paymentIncomingService: PaymentIncomingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreatePaymentIncomingDto,
  ) {
    return this.paymentIncomingService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('status') status?: DocumentStatus,
  ) {
    return this.paymentIncomingService.findAll(user.id, organizationId, status);
  }

  @Get(':paymentId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.paymentIncomingService.findOne(user.id, organizationId, paymentId);
  }

  @Patch(':paymentId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('paymentId') paymentId: string,
    @Body() updateDto: UpdatePaymentIncomingDto,
  ) {
    return this.paymentIncomingService.update(
      user.id,
      organizationId,
      paymentId,
      updateDto,
    );
  }

  @Post(':paymentId/post')
  async post(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.paymentIncomingService.post(user.id, organizationId, paymentId);
  }

  @Post(':paymentId/cancel')
  async cancel(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.paymentIncomingService.cancel(user.id, organizationId, paymentId);
  }

  @Delete(':paymentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('paymentId') paymentId: string,
  ) {
    await this.paymentIncomingService.remove(user.id, organizationId, paymentId);
  }
}
