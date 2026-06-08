import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { TravelRequest } from '../travel-request/entities/travel-request.entity';
import { ExpenseClaim } from '../expense-claims/entities/expense-claim.entity';
import { Reimbursement } from '../reimbursement/entities/reimbursement.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(TravelRequest) private travelRepo: Repository<TravelRequest>,
    @InjectRepository(ExpenseClaim) private claimRepo: Repository<ExpenseClaim>,
    @InjectRepository(Reimbursement) private reimbRepo: Repository<Reimbursement>,
  ) {}

  async getKpiSummary() {
    const [totalUsers, activeUsers] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { isActive: true } }),
    ]);

    const [totalTravel, approvedTravel, pendingTravel] = await Promise.all([
      this.travelRepo.count(),
      this.travelRepo.count({ where: { status: 'APPROVED' as any } }),
      this.travelRepo.count({ where: { status: 'SUBMITTED' as any } }),
    ]);

    const [totalClaims, approvedClaims, flaggedClaims] = await Promise.all([
      this.claimRepo.count(),
      this.claimRepo.count({ where: { status: 'APPROVED' as any } }),
      this.claimRepo
        .createQueryBuilder('ec')
        .leftJoin('ec.lineItems', 'li')
        .where('li.isPolicyFlagged = true')
        .getCount(),
    ]);

    const totalSpend = await this.claimRepo
      .createQueryBuilder('ec')
      .select('SUM(ec.totalAmount)', 'total')
      .where('ec.status IN (:...statuses)', { statuses: ['APPROVED', 'PAYMENT_INITIATED', 'REIMBURSED'] })
      .getRawOne();

    const totalReimbursed = await this.reimbRepo
      .createQueryBuilder('r')
      .select('SUM(r.amount)', 'total')
      .where('r.status = :status', { status: 'PAID' })
      .getRawOne();

    const adoptionRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
    const complianceRate = totalClaims > 0
      ? Math.round(((totalClaims - flaggedClaims) / totalClaims) * 100)
      : 100;

    return {
      users: { total: totalUsers, active: activeUsers, adoptionRate },
      travelRequests: { total: totalTravel, approved: approvedTravel, pending: pendingTravel },
      expenseClaims: { total: totalClaims, approved: approvedClaims, flagged: flaggedClaims, complianceRate },
      financials: {
        totalSpend: parseFloat(totalSpend?.total || '0'),
        totalReimbursed: parseFloat(totalReimbursed?.total || '0'),
      },
      kpis: {
        adoptionRate,
        complianceRate,
        digitalSubmissionRate: 100,
      },
    };
  }

  async getEmployeeSummary(userId: string) {
    const [myTravel, myExpenses, myReimb] = await Promise.all([
      this.travelRepo.find({ where: { employeeId: userId }, order: { createdAt: 'DESC' }, take: 5 }),
      this.claimRepo.find({ where: { employeeId: userId }, order: { createdAt: 'DESC' }, take: 5 }),
      this.reimbRepo.find({ where: { employeeId: userId }, order: { createdAt: 'DESC' }, take: 5 }),
    ]);
    return { myTravel, myExpenses, myReimb };
  }

  async getManagerSummary(managerId: string) {
    const pendingApprovals = await this.travelRepo
      .createQueryBuilder('tr')
      .leftJoin('tr.employee', 'emp')
      .where('emp.managerId = :managerId', { managerId })
      .andWhere('tr.status = :status', { status: 'SUBMITTED' })
      .getCount();

    return { pendingApprovals };
  }
}
