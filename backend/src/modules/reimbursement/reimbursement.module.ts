import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReimbursementService } from './reimbursement.service';
import { ReimbursementController } from './reimbursement.controller';
import { Reimbursement } from './entities/reimbursement.entity';
import { ExpenseClaim } from '../expense-claims/entities/expense-claim.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reimbursement, ExpenseClaim]), AuditLogsModule, NotificationsModule],
  providers: [ReimbursementService],
  controllers: [ReimbursementController],
  exports: [ReimbursementService],
})
export class ReimbursementModule {}
