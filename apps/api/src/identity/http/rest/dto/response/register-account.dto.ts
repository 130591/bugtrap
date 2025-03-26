import { Expose } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class User {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Expose()
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;
}


export class Account {
  @ApiProperty({ example: '501645ed-694b-4537-a7d2-b36dd857183e' })
  @IsNotEmpty()
  @IsUUID()
  @Expose()
  id: string;

  @ApiProperty({ example: 'john.doe@example2.com' })
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  lastName: string;

  @ApiProperty({ example: 'my company' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  accountName: string;

  @ApiProperty({ example: 'pending' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  status: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  passwordHash: string;

  @ApiProperty({ example: '2025-03-21T12:51:56.154Z' })
  @IsNotEmpty()
  @IsDate()
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2025-03-21T12:51:56.154Z' })
  @IsNotEmpty()
  @IsDate()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ example: null, nullable: true })
  @IsOptional()
  @IsString()
  @Expose()
  activationToken?: string | null;

  @ApiProperty({ example: null, nullable: true })
  @IsOptional()
  @IsString()
  @Expose()
  portraitImage?: string | null;

  @ApiProperty({ example: null, nullable: true })
  @IsOptional()
  @IsNumber()
  @Expose()
  hourlyRate?: number | null;

  @ApiProperty({ example: null, nullable: true })
  @IsOptional()
  @IsDate()
  @Expose()
  deletedAt?: Date | null;
}


export class RegisterAccountResponseDto {
  @ApiProperty({ example: 'success' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  status: string;

  @ApiProperty({ type: User })
  @Expose()
  data: Account;

  @ApiProperty({ example: 'Account created successfully' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  message: string;
}
