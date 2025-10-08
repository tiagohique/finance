import { Module } from '@nestjs/common';
import { SalariesService } from './salaries.service';
import { SalariesController } from './salaries.controller';
import { SalariesRepository } from './salaries.repository';

@Module({
  providers: [SalariesService, SalariesRepository],
  controllers: [SalariesController],
  exports: [SalariesService, SalariesRepository],
})
export class SalariesModule {}
