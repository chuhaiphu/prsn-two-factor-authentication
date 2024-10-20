import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common'
import { Response, Request } from 'express'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger();

  constructor() {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    
    let status = 500
    let message = ""

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      message = exception.getResponse() as string
    } else if (exception instanceof Error) {
      message = exception.message
    }

    this.logger.error(
      `${request.method} ${request.originalUrl} ${status} error: ${message}`
    )

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: message,
    })
  }
}
