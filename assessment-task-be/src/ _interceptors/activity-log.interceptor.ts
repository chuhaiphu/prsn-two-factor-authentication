import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { PrismaService } from '../prisma/prisma.service'
import { Reflector } from '@nestjs/core'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ActivityLogInterceptor.name);

  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.get<string>('activityLog', context.getHandler())
    if (!action) return next.handle();

    const request = context.switchToHttp().getRequest()
    const userId = request.user?.id || `anonymous-${uuidv4()}`
    const ipAddress = request.ip

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(`Logging activity: Action: ${action}, UserId: ${userId}, IP: ${ipAddress}`)
          this.prisma.activityLog.create({
            data: {
              action,
              ipAddress,
              user: userId.startsWith('anonymous-') 
                ? undefined 
                : { connect: { id: userId } }
            },
          }).then(() => {
            this.logger.log('Activity log created successfully')
          }).catch(error => {
            this.logger.error(`Failed to create activity log: ${error.message}`)
          })
        }
      }),
    )    
  }
}
