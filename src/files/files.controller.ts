import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Req, Query, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import type { Response } from 'express';
import path from 'path';
import { diskStorage } from 'multer';
import * as fs from 'fs';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req: any, file, cb) => {
        const uploadPath = path.join('uploads', req.user.id)
        fs.mkdirSync(uploadPath, { recursive: true })
        cb(null, uploadPath)
      },
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`
        cb(null, uniqueName)
      }

    }),
    limits: { fileSize: 100 * 1024 * 1024 }
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.filesService.handleFileUpload(file, req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-files')
  getMyFiles(@Req() req) {
    return this.filesService.getFilesByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('generate-link/:fileId')
  getDownloadLink(
    @Param('fileId') fileId: string,
    @Req() req,

  ) {
    return this.filesService.generateDownloadLink(
      fileId,
      req.user.id,
    );
  }


  @Get('download')
  downloadFile(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    this.filesService.downloadFile(token, res)
  }

}
