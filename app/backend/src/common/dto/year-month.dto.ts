import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class YearMonthDto {
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  year!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;
}
