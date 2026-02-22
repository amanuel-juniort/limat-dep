import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  getDailySummary(@Query('date') dateString?: string) {
    const date = dateString ? new Date(dateString) : new Date();
    return this.reportsService.getDailySummary(date);
  }

  @Get('inventory')
  getInventoryStatus() {
    return this.reportsService.getInventoryStatus();
  }
}
