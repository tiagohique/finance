import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from './categories.repository';

@Module({
  providers: [CategoriesService, CategoriesRepository],
  controllers: [CategoriesController],
  exports: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}
