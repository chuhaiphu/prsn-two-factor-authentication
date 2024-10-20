import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Roles } from './role.decorator'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(Roles, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!roles) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization
    if (!authHeader) return false

    const token = authHeader.split(' ')[1]
    const userRole = this.jwtService.decode(token).role
    
    return roles.includes(userRole)
  }
} 