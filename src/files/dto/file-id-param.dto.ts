import { IsUUID } from 'class-validator';

export class FileIdParamDto {
    @IsUUID('4', { message: 'fileId must be a valid UUID' })
    fileId: string;
}