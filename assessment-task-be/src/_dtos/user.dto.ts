import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator'

export class UserDto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  @IsNotEmpty()
  email?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  password?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone?: string

  @IsEnum(['USER', 'MANAGER', 'ADMIN'])
  @IsOptional()
  @IsNotEmpty()
  role?: string

  @IsString()
  @IsOptional()
  verification_token?: string
}
