import { Injectable } from '@nestjs/common';
import { JsonFileRepository } from '../common/file-db/json-file.repository';
import { User } from './user.entity';

@Injectable()
export class UsersRepository extends JsonFileRepository<User> {
  constructor() {
    super({ filename: 'users.json' });
  }
}
