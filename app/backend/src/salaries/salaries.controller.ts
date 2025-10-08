import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SalariesService } from './salaries.service';
import { SalariesQueryDto } from './dto/salaries-query.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';

@ApiTags('salaries')
@Controller('salaries')
export class SalariesController {
  constructor(private readonly service: SalariesService) {}

  @Get()
  findAll(@Query() query: SalariesQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':year/:month')
  findOne(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.service.findOne(year, month);
  }

  @Put(':year/:month')
  upsert(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body() dto: UpdateSalaryDto,
  ) {
    return this.service.upsert(year, month, dto);
  }
}
