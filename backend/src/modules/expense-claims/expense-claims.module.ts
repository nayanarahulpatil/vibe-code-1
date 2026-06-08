import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseClaimsService } from './expense-claims.service';
import { ExpenseClaimsController } from './expense-claims.controller';
import { ExpenseClaim, ExpenseLineItem } from './entities/expense-claim.entity';
import { PolicyEngineModule } from '../policy-engine/policy-engine.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseClaim, ExpenseLineItem]), PolicyEngineModule, AuditLogsModule, NotificationsModule],
  providers: [ExpenseClaimsService],
  controllers: [ExpenseClaimsController],
  exports: [ExpenseClaimsService],
})
export class ExpenseClaimsModule {}
