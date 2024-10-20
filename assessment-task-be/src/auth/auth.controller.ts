import { Controller, Post, UseGuards, Request, Query, UnauthorizedException, UseInterceptors, Get } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger'
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
  @ApiOperation({ summary: 'Authenticate user and return JWT tokens or 2FA temp token if 2FA is enabled' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using a valid refresh token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ActivityLog('refresh token attempt')
  @UseGuards(AuthGuard("jwt-refresh-token-strat"))
  resetToken(@Request() req: { user: User }) {
    return this.authService.resetToken(req.user)
  }

  @Post('2fa/setup')
  @ApiOperation({ summary: 'Set up 2FA for a user and return QR code data URL' })
  @ApiResponse({ status: 200, description: 'QR code data URL returned' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiQuery({ name: 'userId', type: String })
  @UseGuards(AuthGuard("jwt-token-strat"))
  async setup2FA(@Query('userId') userId: string) {
    return this.authService.setup2FA(userId)
  }

  @Post('2fa/turn-on')
  @ApiOperation({ summary: 'Turn on 2FA for a user after verifying the provided 2FA code' })
  @ApiResponse({ status: 200, description: '2FA turned on successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid 2FA code' })
  @ApiQuery({ name: 'twoFACode', type: String })
  @UseGuards(AuthGuard("jwt-token-strat"))
  @ActivityLog('turn on two fa attempt')
  async turnOnTwoFactorAuthentication(
    @Request() req,
    @Query('twoFACode') twoFACode: string,
  ) {
    await this.authService.turnOnTwoFactorAuthentication(req.user.userId, twoFACode)
    return { message: '2FA has been turned on successfully' }
  }  

  @Post('2fa/turn-off')
  @ApiOperation({ summary: 'Turn off 2FA for a user' })
  @ApiResponse({ status: 200, description: '2FA turned off successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AuthGuard("jwt-token-strat"))
  @ActivityLog('turn off two fa attempt')
  async turnOffTwoFactorAuthentication(@Request() req) {
    await this.authService.turnOffTwoFactorAuthentication(req.user.userId);
    return { message: '2FA has been turned off successfully' }
  }

  @Post('2fa/authenticate')
  @ApiOperation({ summary: 'Authenticate with 2FA and return JWT tokens' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated with 2FA' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid 2FA code or temp token' })
  @ApiQuery({ name: 'tempToken', type: String })
  @ApiQuery({ name: 'twoFactorAuthenticationCode', type: String })
  @UseGuards(ThrottlerGuard)
  @ActivityLog('login with 2fa attempt')
  async authenticate2FAAndLogin(
    @Query('tempToken') tempToken: string,
    @Query('twoFactorAuthenticationCode') twoFactorAuthenticationCode: string
  ) {
    return this.authService.login2FA(tempToken, twoFactorAuthenticationCode)
  }

  @Get('test/user')
  @ApiOperation({ summary: 'Test endpoint for authenticated users' })
  @ApiResponse({ status: 200, description: 'User is authenticated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AuthGuard("jwt-token-strat"))
  @ActivityLog('check user attempt')
  checkUser() {
    return "authenticated"
  }
  
  @Get('test/admin')
  @ApiOperation({ summary: 'Test endpoint for authenticated admin' })
  @ApiResponse({ status: 200, description: 'Admin is authenticated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @UseGuards(AuthGuard("jwt-token-strat"), RolesGuard)
  @Roles(["ADMIN"])
  @ActivityLog('check admin attempt')
  checkAdmin() {
    return "authenticated"
  }
}
