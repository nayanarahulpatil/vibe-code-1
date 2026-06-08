import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('policy_rules')
export class PolicyRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'rule_type', length: 50 })
  ruleType: string;

  @Column({ nullable: true, length: 50 })
  category: string;

  @Column({ name: 'limit_amount', nullable: true, type: 'numeric', precision: 12, scale: 2 })
  limitAmount: number;

  @Column({ name: 'limit_days', nullable: true, type: 'int' })
  limitDays: number;

  @Column({ length: 50, default: 'ALL' })
  scope: string;

  @Column({ name: 'scope_value', nullable: true, length: 100 })
  scopeValue: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
