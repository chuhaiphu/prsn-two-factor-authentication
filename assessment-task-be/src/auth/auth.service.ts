import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { authenticator } from 'otplib'
import { toDataURL } from 'qrcode'
import { LoginDto } from '../_dtos/login.dto'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { jwtConstants } from 'src/_constants/jwt.constant'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async validateUser(loginData: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: loginData.usernameOrEmail },
          { email: loginData.usernameOrEmail },
        ],
      },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatch = await bcrypt.compare(loginData.password, user.password)
    if (isPasswordMatch) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  async validateRefreshToken(input_refresh_token: string) {
    const token = input_refresh_token.split(' ')[1]
    const user = await this.prisma.user.findFirst({
      where: { refreshToken: token },
    })

    if (user) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role }
    const access_token = this.jwtService.sign(payload, { expiresIn: '24h', secret: jwtConstants.access_token_secret })
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '1w', secret: jwtConstants.refresh_token_secret })

    // Save refresh token to the database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refresh_token },
    })

    return {
      access_token,
      refresh_token,
    }
  }

  async generateTempToken(user: User) {
    const payload = { sub: user.id, email: user.email, isTempToken: true }
    return this.jwtService.sign(payload, { expiresIn: '5m', secret: jwtConstants.temp_token_secret })
  }
  
  async login2FA(tempToken: string, twoFACode: string) {
    const decoded = this.jwtService.verify(tempToken, { secret: jwtConstants.temp_token_secret })
    if (!decoded.isTempToken) {
      throw new UnauthorizedException('Invalid token')
    }
  
    const user = await this.prisma.user.findUnique({ where: { id: decoded.sub } })
    if (!user) {
      throw new NotFoundException('User not found')
    }
  
    const isCodeValid = this.isTwoFactorAuthenticationCodeValid(twoFACode, user)
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code')
    }
  
    return this.login(user)
  }

  async resetToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role }
    const access_token = this.jwtService.sign(payload, { expiresIn: '24h', secret: jwtConstants.access_token_secret })
    return {
      access_token
    }
  }

  async setup2FA(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found')
    }
    const { otpauthUrl } = await this.generateTwoFactorAuthenticationSecret(user);
    const qrCodeDataUrl = await this.generateQrCodeDataURL(otpauthUrl);
    return { qrCodeDataUrl }
  }
  
  // * create QR code to scan and TOTP code to login
  async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret()
    const otpauthUrl = authenticator.keyuri(user.email, 'ACCESSMENT_TEST', secret)
    await this.setTwoFactorAuthenticationSecret(secret, user.id)
    return {
      otpauthUrl
    }
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl)
  }

  // * save TOTP code to database
  async setTwoFactorAuthenticationSecret(secret: string, userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFASecret: secret }
    })
  }

  async turnOnTwoFactorAuthentication(userId: string, twoFACode: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    })
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isCodeValid = this.isTwoFactorAuthenticationCodeValid(twoFACode, user)
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFAEnabled: true },
    })
  }

  isTwoFactorAuthenticationCodeValid(twoFACode: string, user: User) {
    return authenticator.verify({
      token: twoFACode,
      secret: user.twoFASecret,
    })
  }

  async turnOffTwoFactorAuthentication(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        isTwoFAEnabled: false,
        twoFASecret: null
      },
    })
  }
  
}