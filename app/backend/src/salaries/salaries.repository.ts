import { Injectable } from '@nestjs/common';
import { JsonFileRepository } from '../common/file-db/json-file.repository';
import { Salary } from './salary.entity';

@Injectable()
export class SalariesRepository extends JsonFileRepository<Salary> {
  constructor() {
    super({ filename: 'salaries.json' });
  }
}
