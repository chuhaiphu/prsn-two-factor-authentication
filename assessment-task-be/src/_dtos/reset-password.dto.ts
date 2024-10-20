import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, IsNotEmpty } from 'class-validator'

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
  newPassword: string
}
