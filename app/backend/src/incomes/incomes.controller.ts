import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IncomesService } from './incomes.service';
import { IncomeQueryDto } from './dto/income-query.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth-user.interface';

@ApiTags('incomes')
@Controller('incomes')
export class IncomesController {
  constructor(private readonly service: IncomesService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: IncomeQueryDto,
  ) {
    return this.service.findAll(user.id, query);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateIncomeDto,
  ) {
    return this.service.create(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateIncomeDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.service.remove(user.id, id);
    return { deleted: true };
  }
}
