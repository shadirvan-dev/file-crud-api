import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @Length(2, 50)
    name: string;

    @IsString()
    @Length(3, 20)
    username: string

    @IsString()
    @Length(8, 100)
    password: string;

}