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
    const d = new Date(date);
    const startOfDay = new Date(d.setHours(0, 0, 0, 0));
    const endOfDay = new Date(d.setHours(23, 59, 59, 999));

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
      .reduce((sum, t) => sum + Number(t.subtotal || 0), 0);

    const salesCount = transactions.filter((t) => t.type === TransactionType.SALE).length;

    const spinRevenue = transactions
      .filter((t) => t.type === TransactionType.SPIN)
      .reduce((sum, t) => sum + Number(t.totalAmount || 0), 0);

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
      select: {
        itemId: true,
        quantity: true,
      }
    });

    // Cache average costs to avoid repetitive DB hits
    const costCache = new Map<number, number>();
    for (const item of saleItems) {
      if (!costCache.has(item.itemId)) {
        costCache.set(item.itemId, await this.purchasesService.calculateAverageCost(item.itemId));
      }
      totalCOGS += (costCache.get(item.itemId) || 0) * item.quantity;
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
      if (!costCache.has(reward.itemId)) {
        costCache.set(reward.itemId, await this.purchasesService.calculateAverageCost(reward.itemId));
      }
      marketingCost += (costCache.get(reward.itemId) || 0) * Math.abs(reward.quantityChange);
    }

    return {
      date: startOfDay,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      salesRevenue: Number(salesRevenue.toFixed(2)),
      salesCount,
      spinRevenue: Number(spinRevenue.toFixed(2)),
      spinCount,
      totalTips: Number(totalTips.toFixed(2)),
      grossProfit: Number((totalRevenue - totalCOGS - marketingCost).toFixed(2)),
      totalCOGS: Number(totalCOGS.toFixed(2)),
      marketingCost: Number(marketingCost.toFixed(2)),
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
