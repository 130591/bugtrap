import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsUUID } from 'class-validator'

export class UserRegisterResponseDto {
	@ApiProperty({ example: '93fb796d-e994-4fda-8adb-c215f9c6374c' })
	@IsUUID()
	@Expose()
	message: string;

	@ApiProperty({ example: 'f4c2a1b6-3a92-4fa1-8979-92d9adbc70f0' })
	@IsUUID()
	@Expose()
	userId: string;
}