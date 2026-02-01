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
import { GoodsWriteOffService } from './goods-write-off.service';
import { CreateGoodsWriteOffDto } from './dto/create-goods-write-off.dto';
import { UpdateGoodsWriteOffDto } from './dto/update-goods-write-off.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';
import { DocumentStatus } from '@prisma/client';

@Controller('organizations/:organizationId/documents/goods-write-off')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class GoodsWriteOffController {
  constructor(private goodsWriteOffService: GoodsWriteOffService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateGoodsWriteOffDto,
  ) {
    return this.goodsWriteOffService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('status') status?: DocumentStatus,
  ) {
    return this.goodsWriteOffService.findAll(user.id, organizationId, status);
  }

  @Get(':writeOffId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('writeOffId') writeOffId: string,
  ) {
    return this.goodsWriteOffService.findOne(user.id, organizationId, writeOffId);
  }

  @Patch(':writeOffId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('writeOffId') writeOffId: string,
    @Body() updateDto: UpdateGoodsWriteOffDto,
  ) {
    return this.goodsWriteOffService.update(
      user.id,
      organizationId,
      writeOffId,
      updateDto,
    );
  }

  @Post(':writeOffId/post')
  async post(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('writeOffId') writeOffId: string,
  ) {
    return this.goodsWriteOffService.post(user.id, organizationId, writeOffId);
  }

  @Post(':writeOffId/cancel')
  async cancel(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('writeOffId') writeOffId: string,
  ) {
    return this.goodsWriteOffService.cancel(user.id, organizationId, writeOffId);
  }

  @Delete(':writeOffId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('writeOffId') writeOffId: string,
  ) {
    await this.goodsWriteOffService.remove(user.id, organizationId, writeOffId);
  }
}
