import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notifRepo: Repository<Notification>,
  ) {}

  async create(dto: Partial<Notification>) {
    const notif = this.notifRepo.create(dto);
    return this.notifRepo.save(notif);
  }

  async getForUser(userId: string, unreadOnly = false) {
    const qb = this.notifRepo.createQueryBuilder('n')
      .where('n.userId = :uid', { uid: userId })
      .orderBy('n.createdAt', 'DESC')
      .take(50);
    if (unreadOnly) qb.andWhere('n.isRead = false');
    return qb.getMany();
  }

  async markRead(id: string, userId: string) {
    await this.notifRepo.update({ id, userId }, { isRead: true, readAt: new Date() });
    return { message: 'Marked as read' };
  }

  async markAllRead(userId: string) {
    await this.notifRepo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.count({ where: { userId, isRead: false } });
  }

  // Travel request notifications
  async notifyTravelSubmitted(tr: any) {
    this.logger.log(`📧 Travel request ${tr.requestNumber} submitted — notifying employee`);
    await this.create({
      userId: tr.employeeId,
      type: 'TRAVEL_REQUEST_SUBMITTED' as any,
      title: 'Travel Request Submitted',
      body: `Your travel request ${tr.requestNumber} to ${tr.destination} has been submitted for approval.`,
      entityType: 'TravelRequest',
      entityId: tr.id,
      entityRef: tr.requestNumber,
    });
  }

  async notifyTravelApproved(tr: any) {
    this.logger.log(`✅ Travel request ${tr.requestNumber} approved`);
    await this.create({
      userId: tr.employeeId,
      type: 'TRAVEL_REQUEST_APPROVED' as any,
      title: 'Travel Request Approved',
      body: `Your travel request ${tr.requestNumber} to ${tr.destination} has been approved!`,
      entityType: 'TravelRequest', entityId: tr.id, entityRef: tr.requestNumber,
    });
  }

  async notifyTravelRejected(tr: any) {
    this.logger.log(`❌ Travel request ${tr.requestNumber} rejected`);
    await this.create({
      userId: tr.employeeId,
      type: 'TRAVEL_REQUEST_REJECTED' as any,
      title: 'Travel Request Rejected',
      body: `Your travel request ${tr.requestNumber} was rejected. Reason: ${tr.rejectionReason}`,
      entityType: 'TravelRequest', entityId: tr.id, entityRef: tr.requestNumber,
    });
  }

  async notifyExpenseSubmitted(claim: any) {
    this.logger.log(`📋 Expense claim ${claim.claimNumber} submitted`);
    await this.create({
      userId: claim.employeeId,
      type: 'EXPENSE_CLAIM_SUBMITTED' as any,
      title: 'Expense Claim Submitted',
      body: `Your expense claim ${claim.claimNumber} for ₹${claim.totalAmount} has been submitted for review.`,
      entityType: 'ExpenseClaim', entityId: claim.id, entityRef: claim.claimNumber,
    });
  }

  async notifyReimbursementComplete(reimb: any) {
    this.logger.log(`💰 Reimbursement ${reimb.reimbursementNumber} completed`);
    await this.create({
      userId: reimb.employeeId,
      type: 'REIMBURSEMENT_COMPLETED' as any,
      title: 'Reimbursement Processed',
      body: `₹${reimb.amount} has been credited to your account. Reference: ${reimb.bankReference}`,
      entityType: 'Reimbursement', entityId: reimb.id, entityRef: reimb.reimbursementNumber,
    });
  }
}
