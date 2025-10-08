import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaymentMethod } from '../expense.entity';

export class CreateExpenseDto {
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

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @Type(() => Boolean)
  @IsBoolean()
  isRecurring!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  @Transform(({ value }) => value?.trim())
  notes?: string;
}
