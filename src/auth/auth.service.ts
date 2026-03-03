import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { AuthJWTPayload } from './types/auth-jwtPayload';

@Injectable()
export class AuthService {

    constructor(private userService: UsersService, private jwtService: JwtService) { }

    private get accessTokenSecret() {
        return process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET
    }

    private get refreshTokenSecret() {
        return process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET
    }

    async validateUser(email: string, password: string) {
        const user = await this.userService.findByEmail(email)
        if (!user) throw new UnauthorizedException("Invalid Credentials")

        const isPasswordMatch = await compare(password, user.password)

        if (!isPasswordMatch) throw new UnauthorizedException("Invalid Credentials")

        return { id: user.id };

    }

    async login(userId: string) {

        return this.generateTokenPair(userId)
    }

    async refreshAccessToken(userId: string) {
        const accessToken = await this.generateAccessToken(userId)

        return { accessToken }
    }

    private async generateTokenPair(userId: string) {
        const accessToken = await this.generateAccessToken(userId)
        const refreshToken = await this.generateRefreshToken(userId)

        return { accessToken, refreshToken }
    }

    private generateAccessToken(userId: string) {
        const payload: AuthJWTPayload = { sub: userId }

        return this.jwtService.signAsync(payload, {
            secret: this.accessTokenSecret,
            expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as never,
        })
    }

    private generateRefreshToken(userId: string) {

        const payload: AuthJWTPayload = { sub: userId }

        return this.jwtService.signAsync(payload, {
            secret: this.refreshTokenSecret,
            expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as never,
        })
    }
}
