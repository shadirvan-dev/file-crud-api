import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import type { Response } from 'express';
import path from 'path';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { DownloadFileQueryDto } from './dto/download-file-query.dto';
import { FileIdParamDto } from './dto/file-id-param.dto';

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
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Only image files are allowed'), false)
      }

      cb(null, true)
    },
    limits: { fileSize: 100 * 1024 * 1024 }
  }))
  uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 100 * 1024 * 1024,
          message: 'file size must not exceed 100MB',
        })
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @Req() req,
  ) {
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
    @Param() params: FileIdParamDto,
    @Req() req,

  ) {
    return this.filesService.generateDownloadLink(
      params.fileId,
      req.user.id,
    );
  }


  @Get('download')
  downloadFile(
    @Query() query: DownloadFileQueryDto,
    @Res() res: Response,
  ) {
    this.filesService.downloadFile(query.token, res)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':fileId')
  deleteFile(
    @Param() params: FileIdParamDto,
    @Req() req,
  ) {
    return this.filesService.deleteFile(
      params.fileId,
      req.user.id,
    );
  }

}
