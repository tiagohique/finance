import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateIncomeDto {
  @IsDateString()
  date!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Transform(({ value }) => value.trim())
  description!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @Transform(({ value }) => value.trim())
  categoryId!: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;
}
