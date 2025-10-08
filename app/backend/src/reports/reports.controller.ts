import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { YearMonthDto } from '../common/dto/year-month.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('summary')
  getSummary(@Query() query: YearMonthDto) {
    return this.service.getSummary(query);
  }

  @Get('export/csv')
  async exportCsv(@Query() query: YearMonthDto, @Res() res: Response) {
    const csv = await this.service.exportCsv(query);
    const filename = `report-${query.year}-${query.month
      .toString()
      .padStart(2, '0')}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`);
    res.send(csv);
  }
}
