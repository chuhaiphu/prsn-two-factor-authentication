import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { jwtConstants } from 'src/_constants/jwt.constant'


@Injectable()
export class JwtTokenStrategy extends PassportStrategy(Strategy, "jwt-token-strat") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.access_token_secret,
    })
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role }
  }
}