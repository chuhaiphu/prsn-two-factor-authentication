import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common'
import { UserService } from './user.service'
import { SignupDto } from 'src/_dtos/signup.dto'
import { UserDto } from 'src/_dtos/user.dto'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { RolesGuard } from 'src/_guards/role.guard'
import { Roles } from 'src/_guards/role.decorator'
import { ResetPasswordDto } from 'src/_dtos/reset-password.dto'
import { TwoFactorAuthGuard } from 'src/_guards/two-factor-auth.guard'

@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }

  // ! USER MAIN
  @ApiTags('User Main')
  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.userService.createUser(signupDto);
  }

  @ApiTags('User Main')
  @UseGuards(AuthGuard('jwt-token-strat'), TwoFactorAuthGuard)
  @Put('update')
  updateUser(
    @Request() req: { user: { userId: any, email: any, role: any } },
    @Body() userData: UserDto) {
    return this.userService.updateUser(req.user.userId, userData)
  }

  @ApiTags('User Main')
  @Post('forget-password')
  forgotPassword(@Query('email') email: string) {
    return this.userService.forgetPassword(email);
  }

  @ApiTags('User Main')
  @Post('reset-password')
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
  findAll() {
    return this.userService.findAll();
  }

  @ApiTags('User Main')
  @UseGuards(AuthGuard('jwt-token-strat'), TwoFactorAuthGuard, RolesGuard)
  @Roles(["ADMIN"])
  @Get('by-pagination')
  findUsersByPagination(@Query('page') page: string, @Query('limit') limit: string) {
    return this.userService.findByPagination(Number(page), Number(limit));
  }

  @ApiTags('User Main')
  @UseGuards(AuthGuard('jwt-token-strat'), TwoFactorAuthGuard)
  @Get('by-id')
  findUserById(@Query('id') id: string) {
    return this.userService.findById(id)
  }

  @ApiTags('User Main')
  @UseGuards(AuthGuard('jwt-token-strat'), TwoFactorAuthGuard)
  @Roles(["ADMIN", "USER"])
  @Delete('delete/:id')
  deleteUser(@Param('id') id: string, @Request() req: { user: { userId: any, email: any, role: any } }) {
    return this.userService.deleteUser(id, req.user.userId, req.user.role)
  }
  //*****************************************************
}
