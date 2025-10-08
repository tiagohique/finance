import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { IncomesModule } from '../incomes/incomes.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { CategoriesModule } from '../categories/categories.module';
import { SalariesModule } from '../salaries/salaries.module';

@Module({
  imports: [IncomesModule, ExpensesModule, CategoriesModule, SalariesModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
