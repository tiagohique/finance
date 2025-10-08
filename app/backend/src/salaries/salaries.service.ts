import { Injectable, NotFoundException } from '@nestjs/common';
import { SalariesRepository } from './salaries.repository';
import { SalariesQueryDto } from './dto/salaries-query.dto';
import { Salary } from './salary.entity';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { toYearMonthKey } from '../common/utils/date.utils';

@Injectable()
export class SalariesService {
  constructor(private readonly repository: SalariesRepository) {}

  async findAll(userId: string, filter: SalariesQueryDto): Promise<Salary[]> {
    const items = await this.repository.findAll();
    const filtered = items.filter((item) => {
      if (item.userId !== userId) {
        return false;
      }
      if (filter.year && item.year !== filter.year) {
        return false;
      }
      if (filter.month && item.month !== filter.month) {
        return false;
      }
      return true;
    });
    return filtered.sort((a, b) => {
      const aKey = toYearMonthKey({ year: a.year, month: a.month });
      const bKey = toYearMonthKey({ year: b.year, month: b.month });
      return aKey.localeCompare(bKey);
    });
  }

  async findOne(userId: string, year: number, month: number): Promise<Salary> {
    const items = await this.repository.findAll();
    const found = items.find(
      (item) =>
        item.userId === userId && item.year === year && item.month === month,
    );
    if (!found) {
      throw new NotFoundException('Salary not found for period');
    }
    return found;
  }

  async upsert(
    userId: string,
    year: number,
    month: number,
    dto: UpdateSalaryDto,
  ): Promise<Salary> {
    const items = await this.repository.findAll();
    const id = `sal_${userId}_${year}-${month.toString().padStart(2, '0')}`;
    const next: Salary = {
      id,
      userId,
      year,
      month,
      amount: dto.amount,
    };
    const index = items.findIndex(
      (item) =>
        item.userId === userId && item.year === year && item.month === month,
    );
    if (index >= 0) {
      items[index] = next;
    } else {
      items.push(next);
    }
    await this.repository.saveAll(items);
    return next;
  }
}
