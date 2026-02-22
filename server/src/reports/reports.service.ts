import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PurchasesService } from '../inventory/purchases.service';
import { StockService } from '../inventory/stock.service';
import { TransactionType, MovementType } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private purchasesService: PurchasesService,
    private stockService: StockService,
  ) {}

  async getDailySummary(date: Date = new Date()) {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const transactions = await this.prisma.transactions.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const salesRevenue = transactions
      .filter((t) => t.type === TransactionType.SALE)
      .reduce((sum, t) => sum + Number(t.subtotal), 0);

    const salesCount = transactions.filter((t) => t.type === TransactionType.SALE).length;

    const spinRevenue = transactions
      .filter((t) => t.type === TransactionType.SPIN)
      .reduce((sum, t) => sum + Number(t.totalAmount), 0);

    const spinCount = transactions.filter((t) => t.type === TransactionType.SPIN).length;

    const totalTips = transactions.reduce((sum, t) => sum + Number(t.tipAmount || 0), 0);
    const totalRevenue = salesRevenue + spinRevenue;

    // Gross Profit calculation using Average Cost
    let totalCOGS = 0;
    const saleItems = await this.prisma.transactionItems.findMany({
      where: {
        transaction: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          type: TransactionType.SALE,
        },
      },
    });

    for (const item of saleItems) {
      const avgCost = await this.purchasesService.calculateAverageCost(item.itemId);
      totalCOGS += avgCost * item.quantity;
    }

    // Spin rewards cost (marketing cost)
    const spinRewards = await this.prisma.inventoryMovements.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        type: MovementType.SPIN_REWARD,
      },
    });

    let marketingCost = 0;
    for (const reward of spinRewards) {
      const avgCost = await this.purchasesService.calculateAverageCost(reward.itemId);
      marketingCost += avgCost * Math.abs(reward.quantityChange);
    }

    return {
      date: startOfDay,
      totalRevenue,
      salesRevenue,
      salesCount,
      spinRevenue,
      spinCount,
      totalTips,
      grossProfit: totalRevenue - totalCOGS - marketingCost,
      totalCOGS,
      marketingCost,
    };
  }

  async getInventoryStatus() {
    const items = await this.prisma.items.findMany({ where: { isActive: true } });
    const status: { id: number; name: string; currentStock: number; valuation: number }[] = [];

    for (const item of items) {
      const currentStock = await this.stockService.calculateStock(item.id);
      const avgCost = await this.purchasesService.calculateAverageCost(item.id);
      status.push({
        id: item.id,
        name: item.name,
        currentStock,
        valuation: currentStock * avgCost,
      });
    }

    return status;
  }
}
