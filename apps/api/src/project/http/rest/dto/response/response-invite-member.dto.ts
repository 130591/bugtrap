import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString,  IsNotEmpty, IsDateString, IsBoolean } from 'class-validator'


export class InviteMemberDto {
  @ApiProperty({ example: 'a3b4c5d6-7e8f-9a10-bb11-cd1234abc567' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  invited_user_id: string;

  @ApiProperty({ example: 'member' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  role: string;

  @ApiProperty({ example: false })
  @IsNotEmpty()
  @IsBoolean()
  @Expose()
  accepted: boolean;

  @ApiProperty({ example: 'everton.paixao16@gmail.com' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  email: string;

  @ApiProperty({ example: 'pending' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  status: string;

  @ApiProperty({ example: '2025-03-20T21:48:26.000Z' })
  @IsNotEmpty()
  @IsDateString()
  @Expose()
  expires_at: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJldmVydG9uLnBhaXhhbzE2QGdtYWlsLmNvbSIsImhvc3RVc2VySWQiOiJhM2I0YzVkNi03ZThmLTlhMTAtYmIxMS1jZDEyMzRhYmM1NjciLCJzdGF0dXMiOiJwZW5kaW5nIiwiaWF0IjoxNzQxOTAyNTA2LCJleHAiOjE3NDI1MDczMDZ9.J1DSsx8QWxu4AZx5uirbck4ms1igeWJGS4pCfEvxaos' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  token: string;

  @ApiProperty({ example: 'f4c2a1b6-3a92-4fa1-8979-92d9adbc70f0' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  account_id: string;

  @ApiProperty({ example: 'a26ca02f-22e0-4dc6-b48e-acefb5281135' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  project_id: string;

  @ApiProperty({ example: '833f405a-da85-47aa-ad5d-5072b2b144e2' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  id: string;

  @ApiProperty({ example: '2025-03-13T21:48:27.087Z' })
  @IsNotEmpty()
  @IsDateString()
  @Expose()
  createdAt: string;

  @ApiProperty({ example: '2025-03-13T21:48:27.087Z' })
  @IsNotEmpty()
  @IsDateString()
  @Expose()
  updatedAt: string;

  @ApiProperty({ example: null })
  @Expose()
  deletedAt: string | null;
}


export class ResponseInviteMemberDto {
	@ApiProperty({ example: 'success' })
	@IsNotEmpty()
	@IsString()
	@Expose()
	status: string;

	@ApiProperty({ type: InviteMemberDto })
	@Expose()
	data: InviteMemberDto;

	@ApiProperty({ example: 'Operation completed successfully' })
	@IsNotEmpty()
	@IsString()
	@Expose()
	message: string;
}