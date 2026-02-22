import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  create(@Req() req, @Body() data: {
    supplierName?: string;
    invoiceNumber?: string;
    items: { itemId: number; quantity: number; unitCost: number }[];
  }) {
    return this.purchasesService.create(req.user.id, data);
  }
}
