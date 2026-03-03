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

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({
    secret: process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET,
    signOptions: {
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as never
    }
  })],
  controllers: [AuthController],
  providers: [AuthService, UsersService, LocalStrategy, JwtStrategy, RefreshJwtStrategy],

})
export class AuthModule {

}
