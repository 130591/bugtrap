import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class AddFavoriteDto {
	@IsNotEmpty()
  @IsString()
  organizationId: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}