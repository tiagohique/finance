import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
  import { ApiTags } from '@nestjs/swagger';
import { IncomesService } from './incomes.service';
import { IncomeQueryDto } from './dto/income-query.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@ApiTags('incomes')
@Controller('incomes')
export class IncomesController {
  constructor(private readonly service: IncomesService) {}

  @Get()
  findAll(@Query() query: IncomeQueryDto) {
    return this.service.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateIncomeDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIncomeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { deleted: true };
  }
}
