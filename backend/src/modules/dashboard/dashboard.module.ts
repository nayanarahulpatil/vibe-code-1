import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User } from '../users/entities/user.entity';
import { TravelRequest } from '../travel-request/entities/travel-request.entity';
import { ExpenseClaim, ExpenseLineItem } from '../expense-claims/entities/expense-claim.entity';
import { Reimbursement } from '../reimbursement/entities/reimbursement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, TravelRequest, ExpenseClaim, ExpenseLineItem, Reimbursement])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
