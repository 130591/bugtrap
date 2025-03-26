import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsOptional, IsString, IsUUID } from 'class-validator'

export class GetAccountResponseDto {
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