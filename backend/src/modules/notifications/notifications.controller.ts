import { Controller, Get, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  getMyNotifications(@Req() req: any, @Query('unread') unread: string) {
    return this.service.getForUser(req.user.sub, unread === 'true');
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: any) {
    return this.service.getUnreadCount(req.user.sub).then((count) => ({ count }));
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Req() req: any) {
    return this.service.markRead(id, req.user.sub);
  }

  @Patch('mark-all-read')
  markAllRead(@Req() req: any) {
    return this.service.markAllRead(req.user.sub);
  }
}
