import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "./pagination.dto";
import { SortingDto } from "./sorting.dto";
import { FilteringDto } from "./filtering.dto";

export class StandardResponseDto<TData> {
  @ApiProperty()
  readonly success?: boolean = true;

  @ApiProperty({ default: false })
  readonly isArray?: boolean;

  @ApiPropertyOptional()
  readonly isPaginated?: boolean;

  @ApiPropertyOptional()
  readonly isSorted?: boolean;

  @ApiPropertyOptional()
  readonly isFiltered?: boolean;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  pagination?: PaginationDto;

  @ApiPropertyOptional()
  sorting?: SortingDto;

  @ApiPropertyOptional()
  filtering?: FilteringDto;

  @ApiProperty()
  data: TData | TData[];

  constructor({
    message,
    pagination,
    sorting,
    filtering,
    data,
  }: StandardResponseDto<TData>) {
    this.message = message;
    this.pagination = pagination;
    this.sorting = sorting;
    this.filtering = filtering;
    this.data = data;
    if (pagination) this.isPaginated = true;
    if (sorting) this.isSorted = true;
    if (filtering) this.isFiltered = true;
    if (data && Array.isArray(data)) {
      this.isArray = true;
    }
  }
}