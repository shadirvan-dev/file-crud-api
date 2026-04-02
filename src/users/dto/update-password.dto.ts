import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdatePasswordDto {
    @IsNotEmpty({ message: 'currentPassword is required' })
    @IsString({ message: 'currentPassword must be a string' })
    currentPassword: string;

    @IsNotEmpty({ message: 'newPassword is required' })
    @IsString({ message: 'newPassword must be a string' })
    @Length(8, 100, {
        message: 'newPassword must be between 8 and 100 characters',
    })
    newPassword: string;
}
