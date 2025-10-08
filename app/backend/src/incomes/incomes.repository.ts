import { Injectable } from '@nestjs/common';
import { JsonFileRepository } from '../common/file-db/json-file.repository';
import { Income } from './income.entity';

@Injectable()
export class IncomesRepository extends JsonFileRepository<Income> {
  constructor() {
    super({ filename: 'incomes.json' });
  }
}
