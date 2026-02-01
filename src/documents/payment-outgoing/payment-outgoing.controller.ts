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
import { PaymentOutgoingService } from './payment-outgoing.service';
import { CreatePaymentOutgoingDto } from './dto/create-payment-outgoing.dto';
import { UpdatePaymentOutgoingDto } from './dto/update-payment-outgoing.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';
import { DocumentStatus } from '@prisma/client';

@Controller('organizations/:organizationId/documents/payment-outgoing')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class PaymentOutgoingController {
  constructor(private paymentOutgoingService: PaymentOutgoingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreatePaymentOutgoingDto,
  ) {
    return this.paymentOutgoingService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('status') status?: DocumentStatus,
  ) {
    return this.paymentOutgoingService.findAll(user.id, organizationId, status);
  }

  @Get(':paymentId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.paymentOutgoingService.findOne(user.id, organizationId, paymentId);
  }

  @Patch(':paymentId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('paymentId') paymentId: string,
    @Body() updateDto: UpdatePaymentOutgoingDto,
  ) {
    return this.paymentOutgoingService.update(
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
    return this.paymentOutgoingService.post(user.id, organizationId, paymentId);
  }

  @Post(':paymentId/cancel')
  async cancel(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.paymentOutgoingService.cancel(user.id, organizationId, paymentId);
  }

  @Delete(':paymentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('paymentId') paymentId: string,
  ) {
    await this.paymentOutgoingService.remove(user.id, organizationId, paymentId);
  }
}
