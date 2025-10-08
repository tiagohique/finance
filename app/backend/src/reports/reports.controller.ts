import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { YearMonthDto } from '../common/dto/year-month.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth-user.interface';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('summary')
  getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: YearMonthDto,
  ) {
    return this.service.getSummary(user.id, query);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('export/csv')
  async exportCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: YearMonthDto,
    @Res() res: Response,
  ) {
    const csv = await this.service.exportCsv(user.id, query);
    const filename = `report-${query.year}-${query.month
      .toString()
      .padStart(2, '0')}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`);
    res.send(csv);
  }
}
