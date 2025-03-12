import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export enum SortingOrder {
  ASC = 'asc',
  DES = 'des',
}

export class SortingQueryDto {
  @IsString()
  @IsOptional()
  sort?: string;
}

export type SortingOperation = {
  field: string;
  order: SortingOrder;
};

export interface SortedResponseOptions {
  sortableFields?: string[];
}

export class SortingDto implements SortedResponseOptions {
  @ApiPropertyOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional()
  @IsArray()
  sort?: SortingOperation[];

  @ApiPropertyOptional()
  @IsArray()
  sortableFields?: string[];

  constructor(init?: Partial<SortingDto>) {
    Object.assign(this, init);
  }
}