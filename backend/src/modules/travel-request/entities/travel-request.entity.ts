import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TravelRequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum TravelPurpose {
  CLIENT_ENGAGEMENT = 'CLIENT_ENGAGEMENT',
  AUDIT = 'AUDIT',
  TRAINING = 'TRAINING',
  CONFERENCE = 'CONFERENCE',
  INTERNAL_MEETING = 'INTERNAL_MEETING',
  SITE_VISIT = 'SITE_VISIT',
  OTHER = 'OTHER',
}

@Entity('travel_requests')
export class TravelRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'request_number', unique: true, length: 20, nullable: true })
  requestNumber: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @Column({ type: 'enum', enum: TravelPurpose })
  purpose: TravelPurpose;

  @Column({ name: 'purpose_description', nullable: true, type: 'text' })
  purposeDescription: string;

  @Column({ length: 200 })
  origin: string;

  @Column({ length: 200 })
  destination: string;

  @Column({ name: 'departure_date', type: 'date' })
  departureDate: string;

  @Column({ name: 'return_date', type: 'date' })
  returnDate: string;

  @Column({ name: 'estimated_cost', type: 'numeric', precision: 12, scale: 2, default: 0 })
  estimatedCost: number;

  @Column({ name: 'advance_required', default: false })
  advanceRequired: boolean;

  @Column({ name: 'advance_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  advanceAmount: number;

  @Column({
    type: 'enum',
    enum: TravelRequestStatus,
    default: TravelRequestStatus.DRAFT,
  })
  status: TravelRequestStatus;

  @Column({ name: 'submitted_at', nullable: true, type: 'timestamptz' })
  submittedAt: Date;

  @Column({ name: 'approved_at', nullable: true, type: 'timestamptz' })
  approvedAt: Date;

  @Column({ name: 'rejected_at', nullable: true, type: 'timestamptz' })
  rejectedAt: Date;

  @Column({ name: 'rejection_reason', nullable: true, type: 'text' })
  rejectionReason: string;

  @Column({ name: 'cancelled_at', nullable: true, type: 'timestamptz' })
  cancelledAt: Date;

  @Column({ name: 'cancellation_reason', nullable: true, type: 'text' })
  cancellationReason: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
