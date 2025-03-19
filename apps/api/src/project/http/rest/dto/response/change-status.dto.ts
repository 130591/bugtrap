import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsString } from 'class-validator'

export class ChangeStatusResponseDto {
	@ApiProperty({ example: 'archived' })
	@IsString()
	@Expose()
	status: string;
}