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
import { CashRegistersService } from './cash-registers.service';
import { CreateCashRegisterDto } from './dto/create-cash-register.dto';
import { UpdateCashRegisterDto } from './dto/update-cash-register.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';

@Controller('organizations/:organizationId/references/cash-registers')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class CashRegistersController {
  constructor(private cashRegistersService: CashRegistersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateCashRegisterDto,
  ) {
    return this.cashRegistersService.create(
      user.id,
      organizationId,
      createDto,
    );
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.cashRegistersService.findAll(
      user.id,
      organizationId,
      includeInactive === 'true',
    );
  }

  @Get(':cashRegisterId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('cashRegisterId') cashRegisterId: string,
  ) {
    return this.cashRegistersService.findOne(
      user.id,
      organizationId,
      cashRegisterId,
    );
  }

  @Patch(':cashRegisterId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('cashRegisterId') cashRegisterId: string,
    @Body() updateDto: UpdateCashRegisterDto,
  ) {
    return this.cashRegistersService.update(
      user.id,
      organizationId,
      cashRegisterId,
      updateDto,
    );
  }

  @Delete(':cashRegisterId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('cashRegisterId') cashRegisterId: string,
  ) {
    await this.cashRegistersService.remove(
      user.id,
      organizationId,
      cashRegisterId,
    );
  }
}
