import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseClaim, ExpenseClaimStatus, ExpenseLineItem } from './entities/expense-claim.entity';
import { PolicyEngineService } from '../policy-engine/policy-engine.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ExpenseClaimsService {
  constructor(
    @InjectRepository(ExpenseClaim)
    private claimRepo: Repository<ExpenseClaim>,
    @InjectRepository(ExpenseLineItem)
    private lineItemRepo: Repository<ExpenseLineItem>,
    private policyEngine: PolicyEngineService,
    private auditService: AuditLogsService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(filters: any = {}) {
    const qb = this.claimRepo.createQueryBuilder('ec')
      .leftJoinAndSelect('ec.employee', 'emp')
      .leftJoinAndSelect('ec.travelRequest', 'tr')
      .leftJoinAndSelect('ec.lineItems', 'li')
      .orderBy('ec.createdAt', 'DESC');

    if (filters.employeeId) qb.andWhere('ec.employeeId = :eid', { eid: filters.employeeId });
    if (filters.status) qb.andWhere('ec.status = :status', { status: filters.status });

    const [data, total] = await qb.skip((filters.page - 1) * 20).take(20).getManyAndCount();
    return { data, total };
  }

  async findOne(id: string) {
    return this.claimRepo.findOneOrFail({ where: { id }, relations: ['employee', 'travelRequest', 'lineItems'] });
  }

  async create(dto: any, userId: string) {
    const claim = this.claimRepo.create({
      travelRequestId: dto.travelRequestId,
      employeeId: userId,
      currency: dto.currency || 'INR',
      status: ExpenseClaimStatus.DRAFT,
    });
    return this.claimRepo.save(claim);
  }

  async addLineItem(claimId: string, dto: any, userId: string) {
    const claim = await this.findOne(claimId);
    const item = this.lineItemRepo.create({ expenseClaimId: claimId, ...dto } as any) as unknown as ExpenseLineItem;

    // Policy validation
    const violations = await this.policyEngine.validate(item);
    if (violations.length > 0) {
      item.isPolicyFlagged = true;
      item.flagReason = violations.map((v) => v.message).join('; ');
    }

    const saved = await this.lineItemRepo.save(item);

    // Recalculate total
    const total = await this.lineItemRepo
      .createQueryBuilder('li')
      .select('SUM(li.amount)', 'total')
      .where('li.expenseClaimId = :id', { id: claimId })
      .getRawOne();
    await this.claimRepo.update(claimId, { totalAmount: total.total || 0 });

    return saved;
  }

  async submit(claimId: string, userId: string) {
    const claim = await this.findOne(claimId);
    claim.status = ExpenseClaimStatus.SUBMITTED;
    claim.submittedAt = new Date();
    const saved = await this.claimRepo.save(claim);

    await this.auditService.log({ userId, action: 'SUBMIT', entityType: 'ExpenseClaim', entityId: claimId, entityRef: saved.claimNumber, description: 'Expense claim submitted' });
    await this.notificationsService.notifyExpenseSubmitted(saved);
    return saved;
  }

  async approveByFinance(claimId: string, userId: string, notes?: string) {
    const claim = await this.findOne(claimId);
    claim.status = ExpenseClaimStatus.APPROVED;
    claim.approvedAt = new Date();
    claim.approvedAmount = claim.totalAmount;
    claim.financeNotes = notes;
    const saved = await this.claimRepo.save(claim);

    await this.auditService.log({ userId, action: 'APPROVE', entityType: 'ExpenseClaim', entityId: claimId, entityRef: saved.claimNumber, description: `Finance approved: ${notes}` });
    return saved;
  }

  async reject(claimId: string, userId: string, reason: string) {
    const claim = await this.findOne(claimId);
    claim.status = ExpenseClaimStatus.REJECTED;
    claim.rejectedAt = new Date();
    claim.rejectionReason = reason;
    const saved = await this.claimRepo.save(claim);

    await this.auditService.log({ userId, action: 'REJECT', entityType: 'ExpenseClaim', entityId: claimId, entityRef: saved.claimNumber, description: `Rejected: ${reason}` });
    return saved;
  }
}
