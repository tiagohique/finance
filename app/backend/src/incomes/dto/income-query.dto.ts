import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { DateRangeQueryDto } from '../../common/dto/date-range-query.dto';

export class IncomeQueryDto extends DateRangeQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Transform(({ value }) => value.trim())
  categoryId?: string;
}
