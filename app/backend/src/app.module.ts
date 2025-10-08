import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SalariesModule } from './salaries/salaries.module';
import { IncomesModule } from './incomes/incomes.module';
import { ExpensesModule } from './expenses/expenses.module';
import { CategoriesModule } from './categories/categories.module';
import { ReportsModule } from './reports/reports.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    SalariesModule,
    IncomesModule,
    ExpensesModule,
    CategoriesModule,
    ReportsModule,
    HealthModule,
  ],
})
export class AppModule {}
