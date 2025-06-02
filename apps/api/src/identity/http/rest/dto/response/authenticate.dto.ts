import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsUUID } from 'class-validator'

export class AuthenticateResponseDto {
	@ApiProperty({ example: '93fb796d-e994-4fda-8adb-c215f9c6374c' })
	@IsUUID()
	@Expose()
	userId: string;

	@ApiProperty({ name: 'accessToken' })
	@IsUUID()
	@Expose()
	accessToken: string;

	@ApiProperty({ name: 'accessToken' })
	@IsUUID()
	@Expose()
	refreshToken: string;

}