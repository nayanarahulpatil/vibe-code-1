import {
  Controller, Get, Post, Put, Patch, Param, Body,
  UseGuards, Req, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('SYSTEM_ADMIN', 'HR_ADMIN')
  @ApiOperation({ summary: 'List all users (Admin/HR only)' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.usersService.findAll(+page, +limit);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@Req() req: any) {
    return this.usersService.findOne(req.user.sub);
  }

  @Get(':id')
  @Roles('SYSTEM_ADMIN', 'HR_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('SYSTEM_ADMIN', 'HR_ADMIN')
  @ApiOperation({ summary: 'Create new user' })
  create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Put(':id')
  @Roles('SYSTEM_ADMIN', 'HR_ADMIN')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @Patch(':id/deactivate')
  @Roles('SYSTEM_ADMIN', 'HR_ADMIN')
  @ApiOperation({ summary: 'Deactivate user account' })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Get(':id/team')
  @Roles('SYSTEM_ADMIN', 'HR_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get team members of a manager' })
  getTeam(@Param('id') id: string) {
    return this.usersService.getTeamMembers(id);
  }
}
