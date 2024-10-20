import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { CredentialsStrategy } from 'src/_strategies/credentials.strategy'
import { JwtTokenStrategy } from 'src/_strategies/jwt.access-token.strategy'
import { JwtRefreshTokenStrategy } from 'src/_strategies/jwt.refresh-token.stategy'
import { PrismaService } from 'src/prisma/prisma.service'
import { Jwt2faStrategy } from 'src/_strategies/jwt-2fa.strategy'
import { UserService } from 'src/user/user.service'


@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
  ],
  providers: [AuthService, UserService, CredentialsStrategy, JwtTokenStrategy, JwtRefreshTokenStrategy, Jwt2faStrategy, PrismaService],
  controllers: [AuthController]
})
export class AuthModule { }

