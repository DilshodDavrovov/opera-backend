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
  ParseBoolPipe,
  ParseDatePipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../organizations/guards/organization-access.guard';

@Controller('organizations/:organizationId/transactions')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(
      user.id,
      organizationId,
      createDto,
    );
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('accountId') accountId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionsService.findAll(user.id, organizationId, {
      accountId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':transactionId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('transactionId') transactionId: string,
  ) {
    return this.transactionsService.findOne(
      user.id,
      organizationId,
      transactionId,
    );
  }

  @Patch(':transactionId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('transactionId') transactionId: string,
    @Body() updateDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(
      user.id,
      organizationId,
      transactionId,
      updateDto,
    );
  }

  @Delete(':transactionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('transactionId') transactionId: string,
  ) {
    await this.transactionsService.remove(
      user.id,
      organizationId,
      transactionId,
    );
  }
}
