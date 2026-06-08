import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private docRepo: Repository<Document>,
  ) {}

  async saveFile(file: Express.Multer.File, userId: string, expenseClaimId?: string, lineItemId?: string) {
    const doc = this.docRepo.create({
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storagePath: file.path,
      uploadedBy: userId,
      expenseClaimId,
      lineItemId,
    });
    return this.docRepo.save(doc);
  }

  async findOne(id: string) {
    return this.docRepo.findOneOrFail({ where: { id } });
  }

  async findForClaim(expenseClaimId: string) {
    return this.docRepo.find({ where: { expenseClaimId, isActive: true } });
  }
}
