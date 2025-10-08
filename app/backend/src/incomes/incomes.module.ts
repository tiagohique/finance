import { Module } from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { IncomesController } from './incomes.controller';
import { IncomesRepository } from './incomes.repository';

@Module({
  providers: [IncomesService, IncomesRepository],
  controllers: [IncomesController],
  exports: [IncomesService, IncomesRepository],
})
export class IncomesModule {}
