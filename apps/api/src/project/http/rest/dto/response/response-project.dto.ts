import { Expose } from 'class-transformer';
import {
	IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString
} from 'class-validator'

class Project {
	@IsArray()
	@IsNotEmpty()
	@IsNumber()
	id: number

	@IsDateString({}, { each: true })
	
	name: string

	description: string
	created_at: string
	updated_at: string
}

export class ResponseDto {
	@IsNotEmpty()
  @IsString()
  @Expose()
	status: string

  data: Project

	@IsNotEmpty()
  @IsString()
  @Expose()
	message: string
}