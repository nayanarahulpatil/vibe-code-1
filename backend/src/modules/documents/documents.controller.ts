import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const ALLOWED_EXTS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_SIZE_MB = 5;

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => cb(null, `${uuidv4()}${extname(file.originalname)}`),
    }),
    limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) {
        return cb(new BadRequestException(`Only ${ALLOWED_EXTS.join(', ')} files allowed`), false);
      }
      cb(null, true);
    },
  }))
  upload(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.service.saveFile(file, req.user.sub, req.body.expenseClaimId, req.body.lineItemId);
  }

  @Get('claim/:claimId')
  getForClaim(@Param('claimId') claimId: string) {
    return this.service.findForClaim(claimId);
  }
}
