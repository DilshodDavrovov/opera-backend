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
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';

@Controller('organizations/:organizationId/references/warehouses')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class WarehousesController {
  constructor(private warehousesService: WarehousesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateWarehouseDto,
  ) {
    return this.warehousesService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.warehousesService.findAll(
      user.id,
      organizationId,
      includeInactive === 'true',
    );
  }

  @Get(':warehouseId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return this.warehousesService.findOne(
      user.id,
      organizationId,
      warehouseId,
    );
  }

  @Patch(':warehouseId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('warehouseId') warehouseId: string,
    @Body() updateDto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(
      user.id,
      organizationId,
      warehouseId,
      updateDto,
    );
  }

  @Delete(':warehouseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    await this.warehousesService.remove(user.id, organizationId, warehouseId);
  }
}
