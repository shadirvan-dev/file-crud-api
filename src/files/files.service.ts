import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import path from 'path';

import * as fs from 'fs';

@Injectable()
export class FilesService {
  constructor(@InjectRepository(FileEntity) private readonly fileRepo: Repository<FileEntity>, private readonly jwtService: JwtService) { }
  async handleFileUpload(file: Express.Multer.File, ownerId: string) {

    const fileItem = this.fileRepo.create({
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      ownerId: ownerId
    })

    await this.fileRepo.save(fileItem)
    return { message: 'File Upload Successfully', fileId: fileItem.id }
  }

  async getFilesByUser(ownerId: string) {
    const files = await this.fileRepo.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });

    return files.map(file => ({
      id: file.id,
      name: file.originalName,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      createdAt: file.createdAt,
    }));
  }

  async generateDownloadLink(fileId: string, userId: string) {
    const file = await this.fileRepo.findOne({ where: { id: fileId } });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const filePath = path.join(
      'uploads',
      userId,
      file.storedName,
    );

    const token = this.jwtService.sign(
      { id: file.id, filePath, orginalName: file.originalName },
      { expiresIn: '1d', secret: process.env.JWT_SECRET }, // change if needed
    );

    return {
      downloadUrl: `http://localhost:3000/files/download?token=${token}`,
      expiresIn: '24 hours',
    };
  }
  async downloadFile(token: string, res: Response) {
    {
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET
        }) as any;

        const filePath = payload.filePath;
        const fileName = payload.orginalName;

        if (!fs.existsSync(filePath)) {
          throw new UnauthorizedException();
        }

        return res.download(filePath, fileName);
      } catch {
        throw new UnauthorizedException('Download link expired or invalid');
      }
    }

  }

  async deleteFile(fileId: string, userId: string) {
    const file = await this.fileRepo.findOne({ where: { id: fileId } });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const filePath = path.join(
      'uploads',
      userId,
      file.storedName,
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.fileRepo.delete(fileId);

    return { message: 'File deleted successfully' };
  }
}
