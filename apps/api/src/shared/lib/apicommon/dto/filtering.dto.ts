
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsString } from 'class-validator'

export type FilteringQueryOperation = {
  field: string
  operation: string
  value: string
};

export type FilteringQueryGroup = {
  anyOf?: FilteringQueryGroup[] | FilteringQueryOperation[]
  allOf?: FilteringQueryGroup[] | FilteringQueryOperation[]
}

interface FilteredResponseOptions {}

export class FilteringDto implements FilteredResponseOptions {
  @ApiPropertyOptional()
  @IsString()
  query?: string

  @ApiPropertyOptional()
  @IsArray()
  filter?: FilteringQueryGroup

  @ApiPropertyOptional()
  @IsArray()
  filterableFields?: string[]

  constructor(init?: Partial<FilteringDto>) {
    Object.assign(this, init)
  }
}
