import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa-strat') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
    })
  }

  async validate(payload: any) {
    const user = await this.userService.findByEmail(payload.email)

    if (!user.isTwoFAEnabled) {
      return user
    }
    if (payload.isTwoFactorAuthenticated) {
      return user
    }
  }
}
