import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email: string;
    @IsString()
    @Length(2, 50)
    name: string;
}