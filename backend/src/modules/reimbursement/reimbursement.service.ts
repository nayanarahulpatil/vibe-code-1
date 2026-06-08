import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reimbursement } from './entities/reimbursement.entity';
import { ExpenseClaim, ExpenseClaimStatus } from '../expense-claims/entities/expense-claim.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReimbursementService {
  constructor(
    @InjectRepository(Reimbursement)
    private reimbRepo: Repository<Reimbursement>,
    @InjectRepository(ExpenseClaim)
    private claimRepo: Repository<ExpenseClaim>,
    private auditService: AuditLogsService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(filters: any = {}) {
    const qb = this.reimbRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.expenseClaim', 'ec')
      .orderBy('r.createdAt', 'DESC');
    if (filters.status) qb.andWhere('r.status = :status', { status: filters.status });
    const [data, total] = await qb.skip(((filters.page || 1) - 1) * 20).take(20).getManyAndCount();
    return { data, total };
  }

  async initiate(expenseClaimId: string, initiatedBy: string) {
    const claim = await this.claimRepo.findOneOrFail({ where: { id: expenseClaimId }, relations: ['employee'] });

    const reimb = this.reimbRepo.create({
      expenseClaimId,
      employeeId: claim.employeeId,
      initiatedBy,
      amount: claim.approvedAmount || claim.totalAmount,
      currency: claim.currency,
      status: 'PAYMENT_INITIATED',
      initiatedAt: new Date(),
    });
    const saved = await this.reimbRepo.save(reimb);

    // Mock banking API call
    const bankRef = `BANK-${Date.now()}`;
    await this.reimbRepo.update(saved.id, {
      status: 'PAID',
      bankReference: bankRef,
      paymentDate: new Date().toISOString().split('T')[0],
      completedAt: new Date(),
    });

    // Update claim status
    await this.claimRepo.update(expenseClaimId, { status: ExpenseClaimStatus.REIMBURSED });

    await this.auditService.log({
      userId: initiatedBy, action: 'PAYMENT_COMPLETE', entityType: 'Reimbursement',
      entityId: saved.id, entityRef: saved.reimbursementNumber,
      description: `Payment of ₹${saved.amount} initiated. Ref: ${bankRef}`,
    });

    const updatedReimb = await this.reimbRepo.findOneBy({ id: saved.id });
    await this.notificationsService.notifyReimbursementComplete(updatedReimb);

    return updatedReimb;
  }

  async findOne(id: string) {
    return this.reimbRepo.findOneOrFail({ where: { id }, relations: ['expenseClaim'] });
  }
}
