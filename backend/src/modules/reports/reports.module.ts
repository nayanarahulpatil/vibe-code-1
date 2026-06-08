import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ExpenseClaim, ExpenseLineItem } from '../expense-claims/entities/expense-claim.entity';
import { TravelRequest } from '../travel-request/entities/travel-request.entity';
import { Reimbursement } from '../reimbursement/entities/reimbursement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseClaim, ExpenseLineItem, TravelRequest, Reimbursement])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
