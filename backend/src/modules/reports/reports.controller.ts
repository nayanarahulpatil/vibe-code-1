import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('spend-by-department')
  @Roles('FINANCE_EXECUTIVE', 'SYSTEM_ADMIN', 'AUDITOR')
  spendByDept(@Query('from') from: string, @Query('to') to: string) {
    const now = new Date().toISOString();
    const monthAgo = new Date(Date.now() - 30 * 24 * 3600000).toISOString();
    return this.service.getTravelSpendByDepartment(from || monthAgo, to || now);
  }

  @Get('policy-violations')
  @Roles('FINANCE_EXECUTIVE', 'COMPLIANCE_OFFICER', 'SYSTEM_ADMIN', 'AUDITOR')
  violations(@Query('from') from: string, @Query('to') to: string) {
    const now = new Date().toISOString();
    const monthAgo = new Date(Date.now() - 30 * 24 * 3600000).toISOString();
    return this.service.getPolicyViolations(from || monthAgo, to || now);
  }

  @Get('reimbursement-aging')
  @Roles('FINANCE_EXECUTIVE', 'SYSTEM_ADMIN', 'AUDITOR')
  aging() { return this.service.getReimbursementAging(); }

  @Get('budget-utilization')
  @Roles('FINANCE_EXECUTIVE', 'SYSTEM_ADMIN')
  budget(@Query('from') from: string, @Query('to') to: string) {
    const now = new Date().toISOString();
    const monthAgo = new Date(Date.now() - 30 * 24 * 3600000).toISOString();
    return this.service.getBudgetUtilization(from || monthAgo, to || now);
  }
}
