import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { GlobalExceptionFilter } from './_filters /global-exception.filter'
import { ResponseInterceptor } from './ _interceptors/response.interceptor'
import { PrismaExceptionFilter } from './_filters /prisma-exception.filter'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { UserService } from './user/user.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.useGlobalFilters(new GlobalExceptionFilter(), new PrismaExceptionFilter())
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('Saigon Digital')
    .setDescription('Assessment Task')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, document)

  const userService = app.get(UserService)
  await userService.createAdminIfNotExists()

  await app.listen(8080)
}

bootstrap()