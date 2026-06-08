import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('kpi')
  @Roles('SYSTEM_ADMIN', 'FINANCE_EXECUTIVE', 'HR_ADMIN', 'COMPLIANCE_OFFICER')
  getKpi() { return this.service.getKpiSummary(); }

  @Get('employee')
  getEmployeeSummary(@Req() req: any) { return this.service.getEmployeeSummary(req.user.sub); }

  @Get('manager')
  @Roles('MANAGER', 'SYSTEM_ADMIN')
  getManagerSummary(@Req() req: any) { return this.service.getManagerSummary(req.user.sub); }
}
