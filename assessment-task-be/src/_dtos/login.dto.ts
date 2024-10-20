import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  usernameOrEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}