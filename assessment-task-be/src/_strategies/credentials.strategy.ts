import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from 'src/auth/auth.service'
import { LoginDto } from '../_dtos/login.dto'


@Injectable()
export class CredentialsStrategy extends PassportStrategy(Strategy, "credentials-strat") {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'usernameOrEmail',
      passwordField: 'password',
    });
  }

  async validate(usernameOrEmail: string, password: string): Promise<any> {
    const loginData: LoginDto = { usernameOrEmail, password }
    const user = await this.authService.validateUser(loginData)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    return user
  }
}