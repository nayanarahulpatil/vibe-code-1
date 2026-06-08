import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ExpenseClaim } from '../../expense-claims/entities/expense-claim.entity';

@Entity('reimbursements')
export class Reimbursement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reimbursement_number', unique: true, length: 20, nullable: true })
  reimbursementNumber: string;

  @ManyToOne(() => ExpenseClaim)
  @JoinColumn({ name: 'expense_claim_id' })
  expenseClaim: ExpenseClaim;

  @Column({ name: 'expense_claim_id', type: 'uuid' })
  expenseClaimId: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @Column({ name: 'initiated_by', nullable: true, type: 'uuid' })
  initiatedBy: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'INR' })
  currency: string;

  @Column({ length: 50, default: 'QUEUED' })
  status: string;

  @Column({ name: 'bank_reference', nullable: true, length: 100 })
  bankReference: string;

  @Column({ name: 'payment_date', nullable: true, type: 'date' })
  paymentDate: string;

  @Column({ name: 'initiated_at', nullable: true, type: 'timestamptz' })
  initiatedAt: Date;

  @Column({ name: 'completed_at', nullable: true, type: 'timestamptz' })
  completedAt: Date;

  @Column({ name: 'failure_reason', nullable: true, type: 'text' })
  failureReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
