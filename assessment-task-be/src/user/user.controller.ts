import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards, UseInterceptors } from '@nestjs/common'
import { UserService } from './user.service'
import { SignupDto } from 'src/_dtos/signup.dto'
import { UserDto } from 'src/_dtos/user.dto'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger'
import { RolesGuard } from 'src/_guards/role.guard'
import { Roles } from 'src/_guards/role.decorator'
import { ResetPasswordDto } from 'src/_dtos/reset-password.dto'
import { TwoFactorAuthGuard } from 'src/_guards/two-factor-auth.guard'
import { ActivityLogInterceptor } from 'src/ _interceptors/activity-log.interceptor'
import { ActivityLog } from 'src/_guards/activity-log.decorator'

@Controller('user')
@ApiTags('User')
@UseInterceptors(ActivityLogInterceptor)
export class UserController {
  constructor(private userService: UserService) { }

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user account with provided username, email, password, and optional phone number' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - Email or username already in use' })
  @ApiBody({ type: SignupDto })
  @ActivityLog('signup attempt')
  signup(@Body() signupDto: SignupDto) {
    return this.userService.createUser(signupDto);
  }

  @Put('update')
  @ApiOperation({ summary: 'Update the current user\'s information including username, email, password, phone, and role' })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ type: UserDto })
  @UseGuards(AuthGuard('jwt-token-strat'), TwoFactorAuthGuard)
  @ActivityLog('update user attempt')
  updateUser(
    @Request() req: { user: { userId: any, email: any, role: any } },
    @Body() userData: UserDto) {
    return this.userService.updateUser(req.user.userId, userData)
  }

  @Post('forget-password')
  @ApiOperation({ summary: 'Initiate password reset process by sending a verification code to the user\'s email' })
  @ApiResponse({ status: 200, description: 'Verification code sent to email' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiQuery({ name: 'email', type: String })
  @ActivityLog('forget password attempt')
  forgotPassword(@Query('email') email: string) {
    return this.userService.forgetPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password using email, verification code, and new password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired verification token' })
  @ApiBody({ type: ResetPasswordDto })
  @ActivityLog('reset password attempt')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const { email, verification_code, newPassword } = resetPasswordDto
    const user = await this.userService.validateVerificationToken(email, verification_code)
    return this.userService.resetPassword(user.userId, newPassword)
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve a list of all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @UseGuards(AuthGuard('jwt-token-strat'), TwoFactorAuthGuard, RolesGuard)
  @Roles(["ADMIN"])
  @ActivityLog('find all user attempt')
  findAll() {
    return this.userService.findAll();
  }

  @Get('by-pagination')
  @ApiOperation({ summary: 'Retrieve a paginated list of users with specified page number and items per page (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return paginated users' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiQuery({ name: 'page', type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, description: 'Number of items per page' })
  @UseGuards(AuthGuard('jwt-token-strat'), TwoFactorAuthGuard, RolesGuard)
  @Roles(["ADMIN"])
  @ActivityLog('find user by pagination attempt')
  findUsersByPagination(@Query('page') page: string, @Query('limit') limit: string) {
    return this.userService.findByPagination(Number(page), Number(limit));
  }

  @Get('by-id')
  @ApiOperation({ summary: 'Retrieve a user by their ID' })
  @ApiResponse({ status: 200, description: 'Return a user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiQuery({ name: 'id', type: String, description: 'User ID' })
  @UseGuards(AuthGuard('jwt-token-strat'), TwoFactorAuthGuard)
  @ActivityLog('find user by id attempt')
  findUserById(@Query('id') id: string) {
    return this.userService.findById(id)
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a user by ID (Admin can delete any user, regular users can only delete their own account)' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', type: String, description: 'User ID to delete' })
  @UseGuards(AuthGuard('jwt-token-strat'), TwoFactorAuthGuard)
  @Roles(["ADMIN", "USER"])
  @ActivityLog('delete user attempt')
  deleteUser(@Param('id') id: string, @Request() req: { user: { userId: any, email: any, role: any } }) {
    return this.userService.deleteUser(id, req.user.userId, req.user.role)
  }
}
