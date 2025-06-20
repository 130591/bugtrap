import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class SearchCommand {
 @IsString()
 @IsNotEmpty()
 searchTerm: string;

 @IsNumber()
 @IsNotEmpty()
 page: number;

 @IsNumber()
 @IsNotEmpty()
 limit: number;

 @IsNumber()
 @IsNotEmpty()
 orderBy: number;
}