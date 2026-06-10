import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelRequest, TravelRequestStatus } from './entities/travel-request.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TravelRequestService {
  constructor(
    @InjectRepository(TravelRequest)
    private travelRepo: Repository<TravelRequest>,
    private auditService: AuditLogsService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(filters: any = {}) {
    const qb = this.travelRepo.createQueryBuilder('tr')
      .leftJoinAndSelect('tr.employee', 'emp')
      .orderBy('tr.createdAt', 'DESC');

    if (filters.employeeId) qb.andWhere('tr.employeeId = :eid', { eid: filters.employeeId });
    if (filters.status) qb.andWhere('tr.status = :status', { status: filters.status });

    const [data, total] = await qb.skip((filters.page - 1) * (filters.limit || 20))
      .take(filters.limit || 20).getManyAndCount();
    return { data, total };
  }

  async findOne(id: string) {
    const tr = await this.travelRepo.findOne({ where: { id }, relations: ['employee', 'employee.manager'] });
    if (!tr) throw new NotFoundException(`Travel request ${id} not found`);
    return tr;
  }

  async findByEmployee(employeeId: string) {
    return this.travelRepo.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingForManager(managerId: string) {
    return this.travelRepo
      .createQueryBuilder('tr')
      .leftJoinAndSelect('tr.employee', 'emp')
      .where('emp.managerId = :managerId', { managerId })
      .andWhere('tr.status = :status', { status: TravelRequestStatus.SUBMITTED })
      .orderBy('tr.submittedAt', 'ASC')
      .getMany();
  }

  async create(dto: Partial<TravelRequest>, userId: string) {
    if (new Date(dto.departureDate) < new Date()) {
      throw new BadRequestException('Departure date cannot be in the past');
    }
    if (new Date(dto.returnDate) < new Date(dto.departureDate)) {
      throw new BadRequestException('Return date must be after departure date');
    }

    // Defensive parsing of numeric strings to avoid Postgres numeric input syntax errors
    const parsedEstimatedCost = Number(dto.estimatedCost);
    const estimatedCost = isNaN(parsedEstimatedCost) ? 0 : parsedEstimatedCost;

    const advanceRequired = !!dto.advanceRequired;
    const parsedAdvanceAmount = Number(dto.advanceAmount);
    const advanceAmount = (!advanceRequired || isNaN(parsedAdvanceAmount)) ? 0 : parsedAdvanceAmount;

    const tr = this.travelRepo.create({
      ...dto,
      estimatedCost,
      advanceRequired,
      advanceAmount,
      employeeId: userId,
      status: TravelRequestStatus.DRAFT,
    });
    const saved = await this.travelRepo.save(tr);

    await this.auditService.log({
      userId, action: 'CREATE', entityType: 'TravelRequest',
      entityId: saved.id, entityRef: saved.requestNumber,
      description: `Travel request created for ${saved.destination}`,
    });

    return saved;
  }

  async submit(id: string, userId: string) {
    const tr = await this.findOne(id);
    if (tr.employeeId !== userId) throw new BadRequestException('Not your request');
    if (tr.status !== TravelRequestStatus.DRAFT) throw new BadRequestException('Only DRAFT requests can be submitted');

    if (!tr.employee.managerId) {
      throw new BadRequestException('No manager assigned to your profile. Please contact HR to set up your reporting manager before submitting travel requests.');
    }

    tr.status = TravelRequestStatus.SUBMITTED;
    tr.submittedAt = new Date();
    const saved = await this.travelRepo.save(tr);

    await this.auditService.log({ userId, action: 'SUBMIT', entityType: 'TravelRequest', entityId: id, entityRef: saved.requestNumber, description: 'Travel request submitted for approval' });
    await this.notificationsService.notifyTravelSubmitted(saved);

    return saved;
  }

  async cancel(id: string, userId: string, reason: string) {
    const tr = await this.findOne(id);
    if (tr.employeeId !== userId) throw new BadRequestException('Not your request');
    if (![TravelRequestStatus.DRAFT, TravelRequestStatus.SUBMITTED].includes(tr.status)) {
      throw new BadRequestException('Cannot cancel at this stage');
    }

    tr.status = TravelRequestStatus.CANCELLED;
    tr.cancelledAt = new Date();
    tr.cancellationReason = reason;
    const saved = await this.travelRepo.save(tr);

    await this.auditService.log({ userId, action: 'CANCEL', entityType: 'TravelRequest', entityId: id, entityRef: saved.requestNumber, description: `Cancelled: ${reason}` });
    return saved;
  }

  async approve(id: string, approverId: string, comments?: string) {
    const tr = await this.findOne(id);
    tr.status = TravelRequestStatus.APPROVED;
    tr.approvedAt = new Date();
    const saved = await this.travelRepo.save(tr);

    await this.auditService.log({ userId: approverId, action: 'APPROVE', entityType: 'TravelRequest', entityId: id, entityRef: saved.requestNumber, description: comments || 'Approved' });
    await this.notificationsService.notifyTravelApproved(saved);
    return saved;
  }

  async reject(id: string, approverId: string, reason: string) {
    const tr = await this.findOne(id);
    tr.status = TravelRequestStatus.REJECTED;
    tr.rejectedAt = new Date();
    tr.rejectionReason = reason;
    const saved = await this.travelRepo.save(tr);

    await this.auditService.log({ userId: approverId, action: 'REJECT', entityType: 'TravelRequest', entityId: id, entityRef: saved.requestNumber, description: `Rejected: ${reason}` });
    await this.notificationsService.notifyTravelRejected(saved);
    return saved;
  }
}
