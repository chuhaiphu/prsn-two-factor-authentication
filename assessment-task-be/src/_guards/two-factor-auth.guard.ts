import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class TwoFactorAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user;

    if (!user) {
      return false
    }

    if (user.isTwoFAEnabled && !user.isTwoFAAuthenticated) {
      return false
    }

    return true
  }
}
