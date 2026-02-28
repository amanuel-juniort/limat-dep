import { Controller, Get, UseGuards, Query, Req, ForbiddenException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  getSummary(
    @Req() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied. Admin role required.');
    }
    const startDate = from ? new Date(from) : new Date();
    const endDate = to ? new Date(to) : startDate;
    return this.reportsService.getSummary(startDate, endDate);
  }

  @Get('inventory')
  getInventoryStatus(@Req() req) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied. Admin role required.');
    }
    return this.reportsService.getInventoryStatus();
  }
}
