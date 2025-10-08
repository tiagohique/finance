import { Injectable } from '@nestjs/common';
import { JsonFileRepository } from '../common/file-db/json-file.repository';
import { Category } from './category.entity';

@Injectable()
export class CategoriesRepository extends JsonFileRepository<Category> {
  constructor() {
    super({ filename: 'categories.json' });
  }
}
