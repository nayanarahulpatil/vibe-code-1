import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface AuditLogDto {
  userId?: string;
  userEmail?: string;
  roleName?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  entityRef?: string;
  description?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  async log(dto: AuditLogDto): Promise<void> {
    try {
      const entry = this.auditRepo.create({
        userId: dto.userId,
        userEmail: dto.userEmail,
        roleName: dto.roleName,
        action: dto.action as any,
        entityType: dto.entityType,
        entityId: dto.entityId,
        entityRef: dto.entityRef,
        description: dto.description,
        oldValue: dto.oldValue,
        newValue: dto.newValue,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      });
      await this.auditRepo.save(entry);
    } catch (err) {
      console.error('Audit log failed:', err.message);
    }
  }

  async findAll(filters: any = {}) {
    const qb = this.auditRepo.createQueryBuilder('al').orderBy('al.createdAt', 'DESC');
    if (filters.userId) qb.andWhere('al.userId = :uid', { uid: filters.userId });
    if (filters.userEmail) qb.andWhere('al.userEmail ILIKE :email', { email: `%${filters.userEmail}%` });
    if (filters.action) qb.andWhere('al.action = :action', { action: filters.action });
    if (filters.entityType) qb.andWhere('al.entityType = :et', { et: filters.entityType });
    if (filters.from) qb.andWhere('al.createdAt >= :from', { from: filters.from });
    if (filters.to) qb.andWhere('al.createdAt <= :to', { to: filters.to });

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }
}
