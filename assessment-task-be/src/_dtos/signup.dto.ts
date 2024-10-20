import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, IsOptional, IsEnum, IsNotEmpty, MinLength } from 'class-validator'

export class SignupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string
  
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone?: string
}
