import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty({ message: 'email is required' })
    @IsEmail({}, { message: 'email must be a valid email address' })
    email: string;

    @IsNotEmpty({ message: 'name is required' })
    @IsString({ message: 'name must be a string' })
    @Length(2, 50, { message: 'name must be between 2 and 50 characters' })
    name: string;

    @IsNotEmpty({ message: 'username is required' })
    @IsString({ message: 'username must be a string' })
    @Length(3, 20, {
        message: 'username must be between 3 and 20 characters',
    })
    username: string;

    @IsNotEmpty({ message: 'password is required' })
    @IsString({ message: 'password must be a string' })
    @Length(8, 100, {
        message: 'password must be between 8 and 100 characters',
    })
    password: string;
}