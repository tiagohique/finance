import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SalariesService } from './salaries.service';
import { SalariesQueryDto } from './dto/salaries-query.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth-user.interface';

@ApiTags('salaries')
@Controller('salaries')
export class SalariesController {
  constructor(private readonly service: SalariesService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SalariesQueryDto,
  ) {
    return this.service.findAll(user.id, query);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':year/:month')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.service.findOne(user.id, year, month);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':year/:month')
  upsert(
    @CurrentUser() user: AuthenticatedUser,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body() dto: UpdateSalaryDto,
  ) {
    return this.service.upsert(user.id, year, month, dto);
  }
}
