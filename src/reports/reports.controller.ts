import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseBoolPipe,
  BadRequestException,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../organizations/guards/organization-access.guard';
import { RoleGuard } from '../organizations/guards/role.guard';
import { RequireRoles } from '../organizations/decorators/require-role.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role, RoleType } from '../common/types/role.type';

@Controller('organizations/:organizationId/reports')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard, RoleGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('balance')
  @RequireRoles(Role.ACCOUNTANT as RoleType, Role.OWNER as RoleType)
  async getBalanceReport(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive?: boolean,
  ) {
    const dateFromDate = dateFrom ? new Date(dateFrom) : null;
    const dateToDate = dateTo ? new Date(dateTo) : null;

    return this.reportsService.getBalanceReport(
      user.id,
      organizationId,
      dateFromDate,
      dateToDate,
      includeInactive || false,
    );
  }

  @Get('profit-loss')
  @RequireRoles(Role.ACCOUNTANT as RoleType, Role.OWNER as RoleType)
  async getProfitLossReport(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive?: boolean,
  ) {
    if (!dateFrom || !dateTo) {
      throw new BadRequestException('dateFrom and dateTo are required for profit-loss report');
    }

    return this.reportsService.getProfitLossReport(
      user.id,
      organizationId,
      new Date(dateFrom),
      new Date(dateTo),
      includeInactive || false,
    );
  }

  @Get('cash-flow')
  @RequireRoles(Role.ACCOUNTANT as RoleType, Role.OWNER as RoleType)
  async getCashFlowReport(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive?: boolean,
  ) {
    if (!dateFrom || !dateTo) {
      throw new BadRequestException('dateFrom and dateTo are required for cash-flow report');
    }

    return this.reportsService.getCashFlowReport(
      user.id,
      organizationId,
      new Date(dateFrom),
      new Date(dateTo),
      includeInactive || false,
    );
  }
}
