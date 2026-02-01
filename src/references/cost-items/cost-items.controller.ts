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
import { CostItemsService } from './cost-items.service';
import { CreateCostItemDto } from './dto/create-cost-item.dto';
import { UpdateCostItemDto } from './dto/update-cost-item.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';

@Controller('organizations/:organizationId/references/cost-items')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class CostItemsController {
  constructor(private costItemsService: CostItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateCostItemDto,
  ) {
    return this.costItemsService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.costItemsService.findAll(
      user.id,
      organizationId,
      includeInactive === 'true',
    );
  }

  @Get(':costItemId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('costItemId') costItemId: string,
  ) {
    return this.costItemsService.findOne(user.id, organizationId, costItemId);
  }

  @Patch(':costItemId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('costItemId') costItemId: string,
    @Body() updateDto: UpdateCostItemDto,
  ) {
    return this.costItemsService.update(
      user.id,
      organizationId,
      costItemId,
      updateDto,
    );
  }

  @Delete(':costItemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('costItemId') costItemId: string,
  ) {
    await this.costItemsService.remove(user.id, organizationId, costItemId);
  }
}
