import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { AuthJWTPayload } from './types/auth-jwtPayload';

@Injectable()
export class AuthService {

    constructor(private userService: UsersService, private jwtService: JwtService) { }

    async validateUser(email: string, password: string) {
        const user = await this.userService.findByEmail(email)
        if (!user) throw new UnauthorizedException("Invalid Credentials")

        const isPasswordMatch = await compare(password, user.password)

        if (!isPasswordMatch) throw new UnauthorizedException("Invalid Credentials")

        return { id: user.id };

    }

    login(userId: string) {

        const payload: AuthJWTPayload = { sub: userId }

        return this.jwtService.sign(payload)
    }
}
