import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PricesService } from './prices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Post()
  create(@Body() data: { itemId: number; price: number }) {
    return this.pricesService.create(data);
  }

  @Get(':itemId')
  findCurrentPrice(@Param('itemId') itemId: string) {
    return this.pricesService.findCurrentPrice(+itemId);
  }

  @Get(':itemId/history')
  findHistory(@Param('itemId') itemId: string) {
    return this.pricesService.findHistory(+itemId);
  }
}
