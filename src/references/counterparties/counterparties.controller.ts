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
import { CounterpartiesService } from './counterparties.service';
import { CreateCounterpartyDto } from './dto/create-counterparty.dto';
import { UpdateCounterpartyDto } from './dto/update-counterparty.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';

@Controller('organizations/:organizationId/references/counterparties')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class CounterpartiesController {
  constructor(private counterpartiesService: CounterpartiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateCounterpartyDto,
  ) {
    return this.counterpartiesService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.counterpartiesService.findAll(
      user.id,
      organizationId,
      includeInactive === 'true',
    );
  }

  @Get(':counterpartyId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('counterpartyId') counterpartyId: string,
  ) {
    return this.counterpartiesService.findOne(
      user.id,
      organizationId,
      counterpartyId,
    );
  }

  @Patch(':counterpartyId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('counterpartyId') counterpartyId: string,
    @Body() updateDto: UpdateCounterpartyDto,
  ) {
    return this.counterpartiesService.update(
      user.id,
      organizationId,
      counterpartyId,
      updateDto,
    );
  }

  @Delete(':counterpartyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('counterpartyId') counterpartyId: string,
  ) {
    await this.counterpartiesService.remove(
      user.id,
      organizationId,
      counterpartyId,
    );
  }
}
