import { Expose } from 'class-transformer'
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterAccountDto {
  @ApiProperty({ example: 'true' })
  @IsNotEmpty()
  @IsBoolean()
  @Expose()
  termsAccepted: boolean;

  @ApiProperty({ example: 'everton.paixao16@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty({ example: 'auth0|67e1cf1d87bc29f1f45e520a' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  userId: string;
}
