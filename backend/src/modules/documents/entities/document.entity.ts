import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'original_name', length: 500 }) originalName: string;
  @Column({ name: 'stored_name', length: 500 }) storedName: string;
  @Column({ name: 'mime_type', length: 100 }) mimeType: string;
  @Column({ name: 'size_bytes', type: 'bigint' }) sizeBytes: number;
  @Column({ name: 'document_type', length: 50, default: 'RECEIPT' }) documentType: string;
  @Column({ name: 'storage_path', length: 1000 }) storagePath: string;
  @Column({ name: 'uploaded_by', type: 'uuid' }) uploadedBy: string;
  @Column({ name: 'expense_claim_id', nullable: true, type: 'uuid' }) expenseClaimId: string;
  @Column({ name: 'line_item_id', nullable: true, type: 'uuid' }) lineItemId: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
