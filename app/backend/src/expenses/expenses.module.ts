import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { ExpensesRepository } from './expenses.repository';

@Module({
  providers: [ExpensesService, ExpensesRepository],
  controllers: [ExpensesController],
  exports: [ExpensesService, ExpensesRepository],
})
export class ExpensesModule {}
