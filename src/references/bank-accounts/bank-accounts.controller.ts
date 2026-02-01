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
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';

@Controller('organizations/:organizationId/references/bank-accounts')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class BankAccountsController {
  constructor(private bankAccountsService: BankAccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateBankAccountDto,
  ) {
    return this.bankAccountsService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.bankAccountsService.findAll(
      user.id,
      organizationId,
      includeInactive === 'true',
    );
  }

  @Get(':bankAccountId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('bankAccountId') bankAccountId: string,
  ) {
    return this.bankAccountsService.findOne(
      user.id,
      organizationId,
      bankAccountId,
    );
  }

  @Patch(':bankAccountId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('bankAccountId') bankAccountId: string,
    @Body() updateDto: UpdateBankAccountDto,
  ) {
    return this.bankAccountsService.update(
      user.id,
      organizationId,
      bankAccountId,
      updateDto,
    );
  }

  @Delete(':bankAccountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('bankAccountId') bankAccountId: string,
  ) {
    await this.bankAccountsService.remove(
      user.id,
      organizationId,
      bankAccountId,
    );
  }
}
