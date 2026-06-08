import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ length: 100 })
  type: string;

  @Column({ length: 50, default: 'BOTH' })
  channel: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'entity_type', nullable: true, length: 100 })
  entityType: string;

  @Column({ name: 'entity_id', nullable: true, type: 'uuid' })
  entityId: string;

  @Column({ name: 'entity_ref', nullable: true, length: 50 })
  entityRef: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', nullable: true, type: 'timestamptz' })
  readAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
