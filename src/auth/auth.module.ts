import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { LocalStrategy } from './strategy/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RefreshJwtStrategy } from './strategy/refresh.strategy';
import { RefreshTokenRevocation } from './entities/refresh-token-revocation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshTokenRevocation]), JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, UsersService, LocalStrategy, JwtStrategy, RefreshJwtStrategy],

})
export class AuthModule {

}
