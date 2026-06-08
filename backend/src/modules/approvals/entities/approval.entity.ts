import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('approval_workflows')
export class ApprovalWorkflow {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'entity_type', length: 50 }) entityType: string;
  @Column({ name: 'entity_id', type: 'uuid' }) entityId: string;
  @Column({ name: 'current_step', default: 1 }) currentStep: number;
  @Column({ name: 'total_steps' }) totalSteps: number;
  @Column({ name: 'is_complete', default: false }) isComplete: boolean;
  @Column({ name: 'completed_at', nullable: true, type: 'timestamptz' }) completedAt: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('approval_steps')
export class ApprovalStep {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'workflow_id', type: 'uuid' }) workflowId: string;
  @Column({ name: 'step_number' }) stepNumber: number;
  @Column({ name: 'step_name', length: 100 }) stepName: string;
  @Column({ name: 'approver_id', type: 'uuid' }) approverId: string;
  @Column({ length: 50, default: 'PENDING' }) status: string;
  @Column({ name: 'action_at', nullable: true, type: 'timestamptz' }) actionAt: Date;
  @Column({ nullable: true, type: 'text' }) comments: string;
  @Column({ name: 'sla_hours', default: 8 }) slaHours: number;
  @Column({ name: 'due_at', nullable: true, type: 'timestamptz' }) dueAt: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
