import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseClaim } from '../expense-claims/entities/expense-claim.entity';
import { TravelRequest } from '../travel-request/entities/travel-request.entity';
import { Reimbursement } from '../reimbursement/entities/reimbursement.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ExpenseClaim) private claimRepo: Repository<ExpenseClaim>,
    @InjectRepository(TravelRequest) private travelRepo: Repository<TravelRequest>,
    @InjectRepository(Reimbursement) private reimbRepo: Repository<Reimbursement>,
  ) {}

  async getTravelSpendByDepartment(from: string, to: string) {
    return this.claimRepo
      .createQueryBuilder('ec')
      .select('u.department', 'department')
      .addSelect('SUM(ec.totalAmount)', 'totalSpend')
      .addSelect('COUNT(ec.id)', 'claimCount')
      .leftJoin('ec.employee', 'u')
      .where('ec.status IN (:...statuses)', { statuses: ['APPROVED', 'PAYMENT_INITIATED', 'REIMBURSED'] })
      .andWhere('ec.submittedAt BETWEEN :from AND :to', { from, to })
      .groupBy('u.department')
      .orderBy('totalSpend', 'DESC')
      .getRawMany();
  }

  async getPolicyViolations(from: string, to: string) {
    return this.claimRepo
      .createQueryBuilder('ec')
      .leftJoinAndSelect('ec.employee', 'emp')
      .leftJoinAndSelect('ec.lineItems', 'li')
      .where('li.isPolicyFlagged = true')
      .andWhere('ec.submittedAt BETWEEN :from AND :to', { from, to })
      .orderBy('ec.submittedAt', 'DESC')
      .getMany();
  }

  async getReimbursementAging() {
    return this.claimRepo
      .createQueryBuilder('ec')
      .leftJoinAndSelect('ec.employee', 'emp')
      .where('ec.status IN (:...statuses)', { statuses: ['APPROVED'] })
      .orderBy('ec.approvedAt', 'ASC')
      .getMany();
  }

  async getBudgetUtilization(from: string, to: string) {
    return this.claimRepo
      .createQueryBuilder('ec')
      .select('u.department', 'department')
      .addSelect('SUM(ec.totalAmount)', 'utilized')
      .leftJoin('ec.employee', 'u')
      .where('ec.submittedAt BETWEEN :from AND :to', { from, to })
      .groupBy('u.department')
      .getRawMany();
  }
}
