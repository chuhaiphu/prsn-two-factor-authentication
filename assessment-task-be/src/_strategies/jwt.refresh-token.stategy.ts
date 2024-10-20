import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from 'src/auth/auth.service'
import { jwtConstants } from 'src/_constants/jwt.constant'


@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refresh-token-strat") {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.refresh_token_secret,
      passReqToCallback: true,
    })
  }

  async validate(req: Request) {
    const user = await this.authService.validateRefreshToken(req.get('authorization'))
    return user
  }
}
