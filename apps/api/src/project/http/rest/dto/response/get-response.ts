import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'

class PaginationDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Expose()
  minLimit: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Expose()
  maxLimit: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  @Expose()
  defaultLimit: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Expose()
  limit: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Expose()
  offset: number;

  @ApiProperty({ example: 39 })
  @IsNumber()
  @Expose()
  count: number;
}

export class GetResponseDto {
  @ApiProperty({ example: '93fb796d-e994-4fda-8adb-c215f9c6374c' })
  @IsUUID()
  @Expose()
  id: string;

  @ApiProperty({ example: '2025-03-05T16:44:42.070Z' })
  @IsString()
  @Expose()
  createdAt: string;

  @ApiProperty({ example: '2025-03-05T16:44:42.070Z' })
  @IsString()
  @Expose()
  updatedAt: string;

  @ApiProperty({ example: null, nullable: true })
  @IsOptional()
  @IsString()
  @Expose()
  deletedAt?: string | null;

  @ApiProperty({ example: 'New Project Example' })
  @IsString()
  @Expose()
  project_name: string;

  @ApiProperty({ example: 'This is an example project for testing.' })
  @IsString()
  @Expose()
  description: string;

  @ApiProperty({ example: '2025-03-28T09:00:00.000Z' })
  @IsString()
  @Expose()
  startDate: string;

  @ApiProperty({ example: '2025-04-01T09:00:00.000Z' })
  @IsString()
  @Expose()
  endDate: string;

  @ApiProperty({ example: 'f4c2a1b6-3a92-4fa1-8979-92d9adbc70f0' })
  @IsUUID()
  @Expose()
  account_id: string;

  @ApiProperty({ example: 'a3b4c5d6-7e8f-9a10-bb11-cd1234abc567' })
  @IsUUID()
  @Expose()
  owner_id: string;
}

export class GetProjectsResponseDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @Expose()
  success: boolean;

  @ApiProperty({ type: PaginationDto })
  @Expose()
  pagination: PaginationDto;

  @ApiProperty({ example: {} })
  @Expose()
  sorting: Record<string, unknown>;

  @ApiProperty({ type: [GetResponseDto] })
  @Expose()
  data: GetResponseDto[];
}
