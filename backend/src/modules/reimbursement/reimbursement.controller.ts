import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReimbursementService } from './reimbursement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reimbursements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reimbursements')
export class ReimbursementController {
  constructor(private readonly service: ReimbursementService) {}

  @Get()
  @Roles('FINANCE_EXECUTIVE', 'SYSTEM_ADMIN', 'AUDITOR')
  findAll(@Query() query: any) { return this.service.findAll({ ...query, page: query.page || 1 }); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post('initiate')
  @Roles('FINANCE_EXECUTIVE', 'SYSTEM_ADMIN')
  initiate(@Body() body: { expenseClaimId: string }, @Req() req: any) {
    return this.service.initiate(body.expenseClaimId, req.user.sub);
  }
}
