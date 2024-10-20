import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator'

export class ResetPasswordDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  verification_code: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string
}
