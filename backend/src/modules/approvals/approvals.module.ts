import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController } from './approvals.controller';
import { ApprovalWorkflow, ApprovalStep } from './entities/approval.entity';
import { TravelRequest } from '../travel-request/entities/travel-request.entity';
import { ExpenseClaim } from '../expense-claims/entities/expense-claim.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalWorkflow, ApprovalStep, TravelRequest, ExpenseClaim]), AuditLogsModule, NotificationsModule],
  providers: [ApprovalsService],
  controllers: [ApprovalsController],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
