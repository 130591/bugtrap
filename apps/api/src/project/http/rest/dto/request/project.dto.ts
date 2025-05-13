import { Expose } from 'class-transformer'
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsArray,
  IsDateString,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ProjectPriority } from '@src/project/persist/entities/project.entity';

export class CreateProjectRequestDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID(4)
  @IsNotEmpty()
  @Expose()
  readonly accountId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  @IsNotEmpty()
  @Expose()
  readonly ownerId: string


  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  @IsNotEmpty()
  @Expose()
  userId: string

  @ApiProperty({ example: 'My Awesome Project' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly projectName: string

  @ApiProperty({ example: 'This is a description of the project.' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly description: string

  @ApiProperty({ example: ['tag1', 'tag2', 'tag3'] })
  @IsArray()
  @IsNotEmpty()
  @Expose()
  readonly tagIds: string[]

  @ApiProperty({ example: ['2025-03-12T10:00:00.000Z', '2025-03-13T10:00:00.000Z'] })
  @IsArray()
  @IsNotEmpty()
  @IsDateString({}, { each: true })
  @Expose()
  readonly beginProject: string[]

  @IsString()
  @Expose()
  priority: ProjectPriority
}
