import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DateRangeQueryDto } from '../../common/dto/date-range-query.dto';

const toOptionalBoolean = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true;
    }
    if (value.toLowerCase() === 'false') {
      return false;
    }
  }
  return value;
};

export class ExpenseQueryDto extends DateRangeQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Transform(({ value }) => value?.trim())
  categoryId?: string;

  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  recurring?: boolean;
}
