import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { AuthJWTPayload } from './types/auth-jwtPayload';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenRevocation } from './entities/refresh-token-revocation.entity';
import { createHash } from 'crypto';

type JwtPayloadWithExp = AuthJWTPayload & { exp?: number };

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        @InjectRepository(RefreshTokenRevocation)
        private readonly refreshTokenRevocationRepo: Repository<RefreshTokenRevocation>,
    ) { }

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

    async refreshAccessToken(userId: string, authHeader?: string | string[]) {
        const refreshToken = this.extractBearerToken(authHeader);
        await this.assertRefreshTokenNotRevoked(refreshToken);

        const accessToken = await this.generateAccessToken(userId)

        return { accessToken }
    }

    async logout(authHeader?: string | string[]) {
        const refreshToken = this.extractBearerToken(authHeader);

        let payload: JwtPayloadWithExp;

        try {
            payload = await this.jwtService.verifyAsync<JwtPayloadWithExp>(refreshToken, {
                secret: this.refreshTokenSecret,
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const tokenHash = this.hashToken(refreshToken);
        const existingRevocation = await this.refreshTokenRevocationRepo.findOne({
            where: { tokenHash },
        });

        if (!existingRevocation) {
            const expiresAt = payload.exp
                ? new Date(payload.exp * 1000)
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            await this.refreshTokenRevocationRepo.save(
                this.refreshTokenRevocationRepo.create({
                    tokenHash,
                    userId: payload.sub,
                    expiresAt,
                }),
            );
        }

        return { message: 'Logged out successfully' };
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
            expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '3m') as never,
        })
    }

    private generateRefreshToken(userId: string) {

        const payload: AuthJWTPayload = { sub: userId }

        return this.jwtService.signAsync(payload, {
            secret: this.refreshTokenSecret,
            expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as never,
        })
    }

    private extractBearerToken(authHeader?: string | string[]) {
        if (!authHeader) {
            throw new UnauthorizedException('Refresh token is required');
        }

        const authorization = Array.isArray(authHeader) ? authHeader[0] : authHeader;
        const [scheme, token] = authorization.split(' ');

        if (scheme !== 'Bearer' || !token) {
            throw new UnauthorizedException('Authorization header must be in format: Bearer <token>');
        }

        return token;
    }

    private async assertRefreshTokenNotRevoked(refreshToken: string) {
        await this.cleanExpiredRevokedTokens();
        const tokenHash = this.hashToken(refreshToken);

        const revokedToken = await this.refreshTokenRevocationRepo.findOne({
            where: { tokenHash },
        });

        if (revokedToken) {
            throw new UnauthorizedException('Refresh token has been revoked. Please login again');
        }
    }

    private async cleanExpiredRevokedTokens() {
        await this.refreshTokenRevocationRepo
            .createQueryBuilder()
            .delete()
            .where('expires_at <= :now', { now: new Date() })
            .execute();
    }

    private hashToken(token: string) {
        return createHash('sha256').update(token).digest('hex');
    }
}
