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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrganizationAccessGuard } from '../../organizations/guards/organization-access.guard';

@Controller('organizations/:organizationId/references/employees')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateEmployeeDto,
  ) {
    return this.employeesService.create(user.id, organizationId, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.employeesService.findAll(
      user.id,
      organizationId,
      includeInactive === 'true',
    );
  }

  @Get(':employeeId')
  async findOne(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.employeesService.findOne(user.id, organizationId, employeeId);
  }

  @Patch(':employeeId')
  async update(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('employeeId') employeeId: string,
    @Body() updateDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(
      user.id,
      organizationId,
      employeeId,
      updateDto,
    );
  }

  @Delete(':employeeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Param('employeeId') employeeId: string,
  ) {
    await this.employeesService.remove(user.id, organizationId, employeeId);
  }
}
