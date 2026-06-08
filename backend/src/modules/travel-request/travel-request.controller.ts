import {
  Controller, Get, Post, Patch, Param, Body,
  UseGuards, Req, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TravelRequestService } from './travel-request.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/jwt-auth.guard';

@ApiTags('Travel Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('travel-requests')
export class TravelRequestController {
  constructor(private readonly service: TravelRequestService) {}

  @Get()
  @Roles('SYSTEM_ADMIN', 'FINANCE_EXECUTIVE', 'HR_ADMIN')
  findAll(@Query() query: any) {
    return this.service.findAll({ ...query, page: query.page || 1, limit: query.limit || 20 });
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my travel requests' })
  findMy(@Req() req: any, @Query() query: any) {
    return this.service.findAll({ employeeId: req.user.sub, ...query, page: query.page || 1 });
  }

  @Get('pending-approvals')
  @Roles('MANAGER', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Get pending approvals for manager' })
  getPending(@Req() req: any) {
    return this.service.findPendingForManager(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create travel request' })
  create(@Body() body: any, @Req() req: any) {
    return this.service.create(body, req.user.sub);
  }

  @Patch(':id/submit')
  @ApiOperation({ summary: 'Submit draft travel request for approval' })
  submit(@Param('id') id: string, @Req() req: any) {
    return this.service.submit(id, req.user.sub);
  }

  @Patch(':id/approve')
  @Roles('MANAGER', 'FINANCE_EXECUTIVE', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Approve a travel request' })
  approve(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.approve(id, req.user.sub, body.comments);
  }

  @Patch(':id/reject')
  @Roles('MANAGER', 'FINANCE_EXECUTIVE', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Reject a travel request' })
  reject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.reject(id, req.user.sub, body.reason);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a travel request' })
  cancel(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.cancel(id, req.user.sub, body.reason);
  }
}
