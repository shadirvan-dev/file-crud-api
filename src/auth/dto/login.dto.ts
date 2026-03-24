import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
    @IsNotEmpty({ message: 'email is required' })
    @IsEmail({}, { message: 'email must be a valid email address' })
    email: string;

    @IsNotEmpty({ message: 'password is required' })
    @IsString({ message: 'password must be a string' })
    @Length(8, 100, {
        message: 'password must be between 8 and 100 characters',
    })
    password: string;
}