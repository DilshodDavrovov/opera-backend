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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../organizations/guards/organization-access.guard';

@Controller('organizations/:organizationId/accounts')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateAccountDto,
  ) {
    return this.accountsService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.accountsService.findAll(
      user.id,
      organizationId,
      includeInactive === 'true',
    );
  }

  @Get(':accountId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('accountId') accountId: string,
  ) {
    return this.accountsService.findOne(user.id, organizationId, accountId);
  }

  @Patch(':accountId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('accountId') accountId: string,
    @Body() updateDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(
      user.id,
      organizationId,
      accountId,
      updateDto,
    );
  }

  @Delete(':accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('accountId') accountId: string,
  ) {
    await this.accountsService.remove(user.id, organizationId, accountId);
  }
}
