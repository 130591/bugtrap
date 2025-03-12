import { Expose } from 'class-transformer'
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

class Project {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Expose()
  id: number;

  @ApiProperty({ example: 'My Project' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ example: 'This is a project description.' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  description: string;

  @ApiProperty({ example: '2025-03-12T10:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  @Expose()
  created_at: string;

  @ApiProperty({ example: '2025-03-12T12:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  @Expose()
  updated_at: string;
}

export class ResponseDto {
  @ApiProperty({ example: 'success' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  status: string;

  @ApiProperty({ type: Project })
  @Expose()
  data: Project;

  @ApiProperty({ example: 'Operation completed successfully' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  message: string;
}
