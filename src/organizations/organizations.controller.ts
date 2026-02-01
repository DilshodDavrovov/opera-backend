import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddUserToOrganizationDto } from './dto/add-user-to-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from './guards/organization-access.guard';
import { RoleGuard } from './guards/role.guard';
import { RequireRoles } from './decorators/require-role.decorator';
import { Role, RoleType } from '../common/types/role.type';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() createDto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(user.id, createDto);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.organizationsService.findAll(user.id);
  }

  @Get(':organizationId')
  @UseGuards(OrganizationAccessGuard)
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
  ) {
    return this.organizationsService.findOne(user.id, organizationId);
  }

  @Patch(':organizationId')
  @UseGuards(OrganizationAccessGuard, RoleGuard)
  @RequireRoles(Role.OWNER as RoleType)
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() updateDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(user.id, organizationId, updateDto);
  }

  @Delete(':organizationId')
  @UseGuards(OrganizationAccessGuard, RoleGuard)
  @RequireRoles(Role.OWNER as RoleType)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
  ) {
    await this.organizationsService.remove(user.id, organizationId);
  }

  @Get(':organizationId/users')
  @UseGuards(OrganizationAccessGuard)
  async getUsers(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
  ) {
    return this.organizationsService.getUsers(user.id, organizationId);
  }

  @Post(':organizationId/users')
  @UseGuards(OrganizationAccessGuard, RoleGuard)
  @RequireRoles(Role.OWNER as RoleType, Role.ACCOUNTANT as RoleType)
  @HttpCode(HttpStatus.CREATED)
  async addUser(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() addUserDto: AddUserToOrganizationDto,
  ) {
    await this.organizationsService.addUser(
      user.id,
      organizationId,
      addUserDto,
    );
  }

  @Delete(':organizationId/users/:userId')
  @UseGuards(OrganizationAccessGuard, RoleGuard)
  @RequireRoles(Role.OWNER as RoleType)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUser(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('userId') targetUserId: string,
  ) {
    await this.organizationsService.removeUser(
      user.id,
      organizationId,
      targetUserId,
    );
  }
}
