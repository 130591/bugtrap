import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsArray,
  IsDateString,
} from 'class-validator';

export class CreateProjectRequestDto {
  @IsUUID(4)
  @IsNotEmpty()
  @Expose()
  readonly accountId: string;

  @IsUUID()
  @IsNotEmpty()
  @Expose()
  readonly ownerId: string

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly projectName: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly description: string;

  @IsArray()
  @IsNotEmpty()
  @Expose()
  readonly tagIds: string[];

  @IsArray()
  @IsNotEmpty()
  @IsDateString({}, { each: true })
  @Expose()
  readonly beginProject: string[];
}
