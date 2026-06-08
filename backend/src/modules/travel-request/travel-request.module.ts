import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelRequestService } from './travel-request.service';
import { TravelRequestController } from './travel-request.controller';
import { TravelRequest } from './entities/travel-request.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([TravelRequest]), AuditLogsModule, NotificationsModule],
  providers: [TravelRequestService],
  controllers: [TravelRequestController],
  exports: [TravelRequestService],
})
export class TravelRequestModule {}
