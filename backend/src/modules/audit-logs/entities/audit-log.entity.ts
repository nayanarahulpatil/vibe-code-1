import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true, type: 'uuid' })
  userId: string;

  @Column({ name: 'user_email', nullable: true, length: 255 })
  userEmail: string;

  @Column({ name: 'role_name', nullable: true, length: 50 })
  roleName: string;

  @Column({ length: 50 })
  action: string;

  @Column({ name: 'entity_type', nullable: true, length: 100 })
  entityType: string;

  @Column({ name: 'entity_id', nullable: true, type: 'uuid' })
  entityId: string;

  @Column({ name: 'entity_ref', nullable: true, length: 50 })
  entityRef: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'old_value', nullable: true, type: 'jsonb' })
  oldValue: any;

  @Column({ name: 'new_value', nullable: true, type: 'jsonb' })
  newValue: any;

  @Column({ name: 'ip_address', nullable: true, length: 50 })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
