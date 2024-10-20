import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards, UseInterceptors } from '@nestjs/common'
import { UserService } from './user.service'
import { SignupDto } from 'src/_dtos/signup.dto'
import { UserDto } from 'src/_dtos/user.dto'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { RolesGuard } from 'src/_guards/role.guard'
import { Roles } from 'src/_guards/role.decorator'
import { ResetPasswordDto } from 'src/_dtos/reset-password.dto'
import { TwoFactorAuthGuard } from 'src/_guards/two-factor-auth.guard'
import { ActivityLogInterceptor } from 'src/ _interceptors/activity-log.interceptor'
import { ActivityLog } from 'src/_guards/activity-log.decorator'

@Controller('user')
@UseInterceptors(ActivityLogInterceptor)
export class UserController {
  constructor(private userService: UserService) { }

  // ! USER MAIN
  @ApiTags('User Main')
  @Post('signup')
  @ActivityLog('signup attempt')
  signup(@Body() signupDto: SignupDto) {
    return this.userService.createUser(signupDto);
  }

  @ApiTags('User Main')
  @UseGuards(AuthGuard('jwt-token-strat'), TwoFactorAuthGuard)
  @Put('update')
  @ActivityLog('update user attempt')
  updateUser(
    @Request() req: { user: { userId: any, email: any, role: any } },
    @Body() userData: UserDto) {
    return this.userService.updateUser(req.user.userId, userData)
  }

  @ApiTags('User Main')
  @Post('forget-password')
  @ActivityLog('forget password attempt')
  forgotPassword(@Query('email') email: string) {
    return this.userService.forgetPassword(email);
  }

  @ApiTags('User Main')
  @Post('reset-password')
  @ActivityLog('reset password attempt')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const { email, verification_code, newPassword } = resetPasswordDto
    const user = await this.userService.validateVerificationToken(email, verification_code)
    return this.userService.resetPassword(user.userId, newPassword)
  }

  @ApiTags('User Main')
  @UseGuards(AuthGuard('jwt-token-strat'), TwoFactorAuthGuard, RolesGuard)
  @Roles(["ADMIN"])
  @Get()
  @ActivityLog('find all user attempt')
  findAll() {
    return this.userService.findAll();
  }

  @ApiTags('User Main')
  @UseGuards(AuthGuard('jwt-token-strat'), TwoFactorAuthGuard, RolesGuard)
  @Roles(["ADMIN"])
  @Get('by-pagination')
  @ActivityLog('find user by pagination attempt')
  findUsersByPagination(@Query('page') page: string, @Query('limit') limit: string) {
    return this.userService.findByPagination(Number(page), Number(limit));
  }

  @ApiTags('User Main')
  @UseGuards(AuthGuard('jwt-token-strat'), TwoFactorAuthGuard)
  @Get('by-id')
  @ActivityLog('find user by id attempt')
  findUserById(@Query('id') id: string) {
    return this.userService.findById(id)
  }

  @ApiTags('User Main')
  @UseGuards(AuthGuard('jwt-token-strat'), TwoFactorAuthGuard)
  @Roles(["ADMIN", "USER"])
  @Delete('delete/:id')
  @ActivityLog('delete user attempt')
  deleteUser(@Param('id') id: string, @Request() req: { user: { userId: any, email: any, role: any } }) {
    return this.userService.deleteUser(id, req.user.userId, req.user.role)
  }
  //*****************************************************
}
