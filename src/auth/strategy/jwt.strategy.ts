import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthJWTPayload } from "../types/auth-jwtPayload";
import { Injectable } from "@nestjs/common";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: String(process.env.JWT_SECRET)
        })
    }


    validate(payload: AuthJWTPayload) {

        return { id: payload.sub }

    }
}