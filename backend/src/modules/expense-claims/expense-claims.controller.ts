import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExpenseClaimsService } from './expense-claims.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/jwt-auth.guard';

@ApiTags('Expense Claims')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expense-claims')
export class ExpenseClaimsController {
  constructor(private readonly service: ExpenseClaimsService) {}

  @Get()
  @Roles('FINANCE_EXECUTIVE', 'SYSTEM_ADMIN', 'AUDITOR')
  findAll(@Query() query: any) { return this.service.findAll({ ...query, page: query.page || 1 }); }

  @Get('my')
  findMy(@Req() req: any, @Query() q: any) { return this.service.findAll({ employeeId: req.user.sub, ...q, page: q.page || 1 }); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() body: any, @Req() req: any) { return this.service.create(body, req.user.sub); }

  @Post(':id/line-items')
  addLineItem(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.service.addLineItem(id, body, req.user.sub); }

  @Patch(':id/submit')
  submit(@Param('id') id: string, @Req() req: any) { return this.service.submit(id, req.user.sub); }

  @Patch(':id/approve')
  @Roles('FINANCE_EXECUTIVE', 'SYSTEM_ADMIN')
  approve(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.service.approveByFinance(id, req.user.sub, body.notes); }

  @Patch(':id/reject')
  @Roles('FINANCE_EXECUTIVE', 'SYSTEM_ADMIN')
  reject(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.service.reject(id, req.user.sub, body.reason); }
}
