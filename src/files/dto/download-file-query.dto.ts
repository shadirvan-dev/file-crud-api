import { IsNotEmpty, IsString } from 'class-validator';

export class DownloadFileQueryDto {
    @IsNotEmpty({ message: 'token is required' })
    @IsString({ message: 'token must be a string' })
    token: string;
}