import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { hash, compare } from 'bcryptjs';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { PublicUser } from './dto/public-user.dto';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10);
const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  async findAll(): Promise<PublicUser[]> {
    const users = await this.repository.findAll();
    return users.map((user) => this.toPublicUser(user));
  }

  async findPublicById(id: string): Promise<PublicUser> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toPublicUser(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const users = await this.repository.findAll();
    return users.find((item) => item.username === username);
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const users = await this.repository.findAll();
    const username = dto.username.toLowerCase();
    this.ensureUniqueUsername(users, username);
    const passwordHash = await hash(dto.password, SALT_ROUNDS);
    const user: User = {
      id: `usr_${nanoid()}`,
      name: dto.name,
      username,
      passwordHash,
    };
    users.push(user);
    await this.repository.saveAll(users);
    return this.toPublicUser(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    const users = await this.repository.findAll();
    const index = users.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException('User not found');
    }
    const current = users[index];
    const next: User = {
      ...current,
      name: dto.name ?? current.name,
      passwordHash: current.passwordHash,
    };
    if (dto.password) {
      next.passwordHash = await hash(dto.password, SALT_ROUNDS);
    }
    users[index] = next;
    await this.repository.saveAll(users);
    return this.toPublicUser(next);
  }

  async remove(id: string): Promise<void> {
    const users = await this.repository.findAll();
    const filtered = users.filter((item) => item.id !== id);
    if (filtered.length === users.length) {
      throw new NotFoundException('User not found');
    }
    await this.repository.saveAll(filtered);
  }

  async validateCredentials(
    username: string,
    password: string,
  ): Promise<User | null> {
    const normalized = username.toLowerCase();
    const user = await this.findByUsername(normalized);
    if (!user) {
      return null;
    }
    const match = await compare(password, user.passwordHash);
    if (!match) {
      return null;
    }
    return user;
  }

  toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
    };
  }

  private ensureUniqueUsername(users: User[], username: string) {
    const exists = users.some((item) => item.username === username);
    if (exists) {
      throw new ConflictException('Username already in use');
    }
  }
}
