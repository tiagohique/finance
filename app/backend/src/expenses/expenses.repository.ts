import { Injectable } from '@nestjs/common';
import { JsonFileRepository } from '../common/file-db/json-file.repository';
import { Expense } from './expense.entity';

@Injectable()
export class ExpensesRepository extends JsonFileRepository<Expense> {
  constructor() {
    super({ filename: 'expenses.json' });
  }
}
