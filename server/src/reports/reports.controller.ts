import { Controller, Get, UseGuards, Query, Req, ForbiddenException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  getDailySummary(@Req() req, @Query('date') dateString?: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied. Admin role required.');
    }
    const date = dateString ? new Date(dateString) : new Date();
    return this.reportsService.getDailySummary(date);
  }

  @Get('inventory')
  getInventoryStatus(@Req() req) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied. Admin role required.');
    }
    return this.reportsService.getInventoryStatus();
  }
}
