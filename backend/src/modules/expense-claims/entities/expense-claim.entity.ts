import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TravelRequest } from '../../travel-request/entities/travel-request.entity';

export enum ExpenseClaimStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  REIMBURSED = 'REIMBURSED',
}

export enum ExpenseCategory {
  FLIGHTS = 'FLIGHTS',
  HOTEL = 'HOTEL',
  MEALS = 'MEALS',
  LOCAL_TRANSPORT = 'LOCAL_TRANSPORT',
  FUEL = 'FUEL',
  CONFERENCE_FEE = 'CONFERENCE_FEE',
  VISA = 'VISA',
  INTERNET = 'INTERNET',
  MISCELLANEOUS = 'MISCELLANEOUS',
}

// ─────────────────────────────────────────────────────────────────
// ExpenseClaim
// ─────────────────────────────────────────────────────────────────
@Entity('expense_claims')
export class ExpenseClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'claim_number', unique: true, length: 20, nullable: true })
  claimNumber: string;

  @ManyToOne(() => TravelRequest)
  @JoinColumn({ name: 'travel_request_id' })
  travelRequest: TravelRequest;

  @Column({ name: 'travel_request_id', type: 'uuid' })
  travelRequestId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @Column({ name: 'total_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'approved_amount', nullable: true, type: 'numeric', precision: 12, scale: 2 })
  approvedAmount: number;

  @Column({ length: 3, default: 'INR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: ExpenseClaimStatus,
    default: ExpenseClaimStatus.DRAFT,
  })
  status: ExpenseClaimStatus;

  @OneToMany(() => ExpenseLineItem, (item) => item.expenseClaim, { cascade: true, eager: true })
  lineItems: ExpenseLineItem[];

  @Column({ name: 'submitted_at', nullable: true, type: 'timestamptz' })
  submittedAt: Date;

  @Column({ name: 'approved_at', nullable: true, type: 'timestamptz' })
  approvedAt: Date;

  @Column({ name: 'rejected_at', nullable: true, type: 'timestamptz' })
  rejectedAt: Date;

  @Column({ name: 'rejection_reason', nullable: true, type: 'text' })
  rejectionReason: string;

  @Column({ name: 'finance_notes', nullable: true, type: 'text' })
  financeNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────
// ExpenseLineItem
// ─────────────────────────────────────────────────────────────────
@Entity('expense_line_items')
export class ExpenseLineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ExpenseClaim, (claim) => claim.lineItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expense_claim_id' })
  expenseClaim: ExpenseClaim;

  @Column({ name: 'expense_claim_id', type: 'uuid' })
  expenseClaimId: string;

  @Column({ type: 'enum', enum: ExpenseCategory })
  category: ExpenseCategory;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'expense_date', type: 'date' })
  expenseDate: string;

  @Column({ name: 'receipt_id', nullable: true, type: 'uuid' })
  receiptId: string;

  @Column({ name: 'is_policy_flagged', default: false })
  isPolicyFlagged: boolean;

  @Column({ name: 'flag_reason', nullable: true, type: 'text' })
  flagReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
