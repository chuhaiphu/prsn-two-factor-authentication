import { Controller, Post, UseGuards, Request, Query, UnauthorizedException, UseInterceptors, Get } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import { ApiBody, ApiTags } from '@nestjs/swagger'
import { LoginDto } from 'src/_dtos/login.dto'
import { ThrottlerGuard } from '@nestjs/throttler'
import { ActivityLog } from 'src/_guards/activity-log.decorator'
import { ActivityLogInterceptor } from 'src/ _interceptors/activity-log.interceptor'
import { Roles } from 'src/_guards/role.decorator'
import { RolesGuard } from 'src/_guards/role.guard'

@Controller('auth')
@ApiTags('Auth')
@UseInterceptors(ActivityLogInterceptor)
export class AuthController {
  constructor(private authService: AuthService) { }

  @UseGuards(ThrottlerGuard, AuthGuard("credentials-strat"))
  @Post('login')
  @ApiBody({ type: LoginDto })
  @ActivityLog('login attempt')
  async login(@Request() req: { user: User }) {
    if (req.user.isTwoFAEnabled) {
      const tempToken = await this.authService.generateTempToken(req.user)
      return {
        message: '2FA required',
        tempToken,
      }
    }
    return this.authService.login(req.user)
  }

  @UseGuards(AuthGuard("jwt-refresh-token-strat"))
  @Post('refresh')
  @ActivityLog('refresh token attempt')
  resetToken(@Request() req: { user: User }) {
    return this.authService.resetToken(req.user)
  }

  @UseGuards(AuthGuard("jwt-token-strat"))
  @Post('2fa/setup')
  async setup2FA(@Query ('userId') userId: string) {
    return this.authService.setup2FA(userId)
  }

  @Post('2fa/turn-on')
  @UseGuards(AuthGuard("jwt-token-strat"))
  @ActivityLog('turn on two fa attempt')
  async turnOnTwoFactorAuthentication(
    @Request() req,
    @Query('twoFACode') twoFACode: string,
  ) {
    await this.authService.turnOnTwoFactorAuthentication(req.user.userId, twoFACode)
  }  

  @UseGuards(AuthGuard("jwt-token-strat"))
  @Post('2fa/turn-off')
  @ActivityLog('turn off two fa attempt')
  async turnOffTwoFactorAuthentication(@Request() req) {
    await this.authService.turnOffTwoFactorAuthentication(req.user.userId);
    return { message: '2FA has been turned off successfully' }
  }

  @UseGuards(ThrottlerGuard)
  @Post('2fa/authenticate')
  @ActivityLog('login with 2fa attempt')
  async authenticate2FAAndLogin(
    @Query('tempToken') tempToken: string,
    @Query('twoFactorAuthenticationCode') twoFactorAuthenticationCode: string
  ) {
    return this.authService.login2FA(tempToken, twoFactorAuthenticationCode)
  }
  

  @UseGuards(AuthGuard("jwt-token-strat"))
  @Get('test/user')
  @ActivityLog('check user attempt')
  checkUser() {
    return "authenticated"
  }
  
  @UseGuards(AuthGuard("jwt-token-strat"), RolesGuard)
  @Roles(["ADMIN"])
  @Get('test/admin')
  @ActivityLog('check admin attempt')
  checkAdmin() {
    return "authenticated"
  }
}