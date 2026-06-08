import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalWorkflow, ApprovalStep } from './entities/approval.entity';

@Injectable()
export class ApprovalsService {
  constructor(
    @InjectRepository(ApprovalWorkflow) private workflowRepo: Repository<ApprovalWorkflow>,
    @InjectRepository(ApprovalStep) private stepRepo: Repository<ApprovalStep>,
  ) {}

  async getPendingForApprover(approverId: string) {
    return this.stepRepo.find({
      where: { approverId, status: 'PENDING' },
      order: { dueAt: 'ASC' },
    });
  }

  async createWorkflow(entityType: string, entityId: string, steps: { stepName: string; approverId: string }[]) {
    const workflow = this.workflowRepo.create({ entityType, entityId, totalSteps: steps.length });
    const savedWorkflow = await this.workflowRepo.save(workflow);

    const stepEntities = steps.map((s, i) => this.stepRepo.create({
      workflowId: savedWorkflow.id,
      stepNumber: i + 1,
      stepName: s.stepName,
      approverId: s.approverId,
      dueAt: new Date(Date.now() + 8 * 3600000), // 8-hour SLA
    }));
    await this.stepRepo.save(stepEntities);
    return savedWorkflow;
  }
}
