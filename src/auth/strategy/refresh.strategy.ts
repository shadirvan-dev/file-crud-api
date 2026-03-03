import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthJWTPayload } from '../types/auth-jwtPayload';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: String(process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET),
        });
    }

    validate(payload: AuthJWTPayload) {
        return { id: payload.sub };
    }
}
