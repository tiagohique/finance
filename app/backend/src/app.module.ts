import { Module } from '@nestjs/common';
import { SalariesModule } from './salaries/salaries.module';
import { IncomesModule } from './incomes/incomes.module';
import { ExpensesModule } from './expenses/expenses.module';
import { CategoriesModule } from './categories/categories.module';
import { ReportsModule } from './reports/reports.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    SalariesModule,
    IncomesModule,
    ExpensesModule,
    CategoriesModule,
    ReportsModule,
    HealthModule,
  ],
})
export class AppModule {}
