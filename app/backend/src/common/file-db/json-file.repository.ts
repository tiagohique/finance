import { promises as fs } from 'fs';
import { dirname, resolve } from 'path';
import { randomUUID } from 'crypto';

interface JsonFileRepositoryOptions<T> {
  filename: string;
  defaultValue?: T[];
  dataDir?: string;
}

class AsyncLock {
  private queue: Promise<void> = Promise.resolve();

  runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(() => fn());
    this.queue = run.then(() => undefined, () => undefined);
    return run;
  }
}

const locks = new Map<string, AsyncLock>();

export class JsonFileRepository<T extends { id: string }> {
  private readonly filePath: string;
  private readonly defaultValue: T[];
  private readonly initPromise: Promise<void>;

  constructor(options: JsonFileRepositoryOptions<T>) {
    const baseDir = options.dataDir ?? resolve(process.cwd(), 'data');
    this.filePath = resolve(baseDir, options.filename);
    this.defaultValue = options.defaultValue ?? [];
    this.initPromise = this.ensureFile();
  }

  async findAll(): Promise<T[]> {
    await this.initPromise;
    const content = await fs.readFile(this.filePath, 'utf-8');
    const parsed: T[] = JSON.parse(content);
    return parsed;
  }

  async findById(id: string): Promise<T | undefined> {
    const all = await this.findAll();
    return all.find((item) => item.id === id);
  }

  async saveAll(items: T[]): Promise<void> {
    await this.initPromise;
    await this.withLock(async () => {
      const payload = JSON.stringify(items, null, 2);
      await this.atomicWrite(payload);
    });
  }

  private async ensureFile(): Promise<void> {
    const directory = dirname(this.filePath);
    await fs.mkdir(directory, { recursive: true });
    try {
      await fs.access(this.filePath);
    } catch {
      const payload = JSON.stringify(this.defaultValue, null, 2);
      await this.atomicWrite(payload);
    }
  }

  private async withLock<R>(fn: () => Promise<R>): Promise<R> {
    let lock = locks.get(this.filePath);
    if (!lock) {
      lock = new AsyncLock();
      locks.set(this.filePath, lock);
    }
    return lock.runExclusive(fn);
  }

  private async atomicWrite(payload: string): Promise<void> {
    const tempPath = `${this.filePath}.${randomUUID()}.tmp`;
    await fs.writeFile(tempPath, payload, 'utf-8');
    await fs.rename(tempPath, this.filePath);
  }
}
