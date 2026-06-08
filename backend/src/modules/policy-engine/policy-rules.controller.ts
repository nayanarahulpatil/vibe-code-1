import { Controller, Get, Post, Put, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PolicyEngineService } from './policy-engine.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/jwt-auth.guard';

@ApiTags('Policy Rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('policy-rules')
export class PolicyRulesController {
  constructor(private readonly service: PolicyEngineService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Post()
  @Roles('COMPLIANCE_OFFICER', 'SYSTEM_ADMIN')
  create(@Body() body: any) { return this.service.create(body); }

  @Put(':id')
  @Roles('COMPLIANCE_OFFICER', 'SYSTEM_ADMIN')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Patch(':id/toggle')
  @Roles('COMPLIANCE_OFFICER', 'SYSTEM_ADMIN')
  toggle(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.service.toggleActive(id, body.isActive);
  }
}
