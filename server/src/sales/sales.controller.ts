import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  createSale(@Req() req, @Body() data: { items: { itemId: number; quantity: number }[]; tipAmount?: number }) {
    console.log('[SalesController] POST /sales', { user: req.user, body: data });
    return this.salesService.createSale(req.user.id, data.items, data.tipAmount);
  }

  @Post('spin')
  createSpin(@Req() req, @Body() data: { spinResult: string; rewardItemId?: number; tipAmount?: number }) {
    return this.salesService.createSpin(req.user.id, data.spinResult, data.rewardItemId, data.tipAmount);
  }

  @Get()
  findAll() {
    return this.salesService.findAll();
  }
}
