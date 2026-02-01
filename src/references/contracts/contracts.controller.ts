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
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';

@Controller('organizations/:organizationId/references/contracts')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateContractDto,
  ) {
    return this.contractsService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('counterpartyId') counterpartyId?: string,
  ) {
    return this.contractsService.findAll(
      user.id,
      organizationId,
      includeInactive === 'true',
      counterpartyId,
    );
  }

  @Get(':contractId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('contractId') contractId: string,
  ) {
    return this.contractsService.findOne(user.id, organizationId, contractId);
  }

  @Patch(':contractId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('contractId') contractId: string,
    @Body() updateDto: UpdateContractDto,
  ) {
    return this.contractsService.update(
      user.id,
      organizationId,
      contractId,
      updateDto,
    );
  }

  @Delete(':contractId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('contractId') contractId: string,
  ) {
    await this.contractsService.remove(user.id, organizationId, contractId);
  }
}
