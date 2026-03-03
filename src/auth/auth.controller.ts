import { Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth/jwt-refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {


  }
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req) {

    const { accessToken, refreshToken } = await this.authService.login(req.user.id)

    return { id: req.user.id, accessToken, refreshToken }
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    return this.authService.refreshAccessToken(req.user.id)
  }

}
