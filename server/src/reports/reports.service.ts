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

  async getSummary(startDate: Date, endDate: Date) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const transactions = await this.prisma.transactions.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
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
    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.totalAmount || 0), 0);

    // Initial breakdown values
    const paymentBreakdown = { CASH: 0, TELEBIRR: 0, CBE: 0 };
    const tipBreakdown = { CASH: 0, TELEBIRR: 0, CBE: 0 };

    transactions.forEach((t) => {
      if (t.paymentMethod === 'CUSTOM' && t.paymentDetails) {
        const details = t.paymentDetails as any;
        paymentBreakdown.CASH += Number(details.CASH || 0);
        paymentBreakdown.TELEBIRR += Number(details.TELEBIRR || 0);
        paymentBreakdown.CBE += Number(details.CBE || 0);

        // We assume tips are currently lumped, but if we wanted to split them 
        // we'd need tipDetails. For now, we attribute tip to the primary methods if simple, 
        // or just keep it simple. If it's CUSTOM, we might just attribute the tip to CASH 
        // or distribute it proportionally. For now, since the UI uses "Keep Change as Tip"
        // mostly for CASH or CUSTOM modal, let's just use the primary method for tips
        // if it's not custom. If it IS custom, we'll attribute to CASH for now as a fallback.
        tipBreakdown.CASH += Number(t.tipAmount || 0);
      } else {
        const method = t.paymentMethod as keyof typeof paymentBreakdown;
        if (paymentBreakdown[method] !== undefined) {
          paymentBreakdown[method] += Number(t.totalAmount || 0);
          tipBreakdown[method] += Number(t.tipAmount || 0);
        }
      }
    });

    // Gross Profit calculation using Average Cost
    let totalCOGS = 0;
    const saleItems = await this.prisma.transactionItems.findMany({
      where: {
        transaction: {
          createdAt: { gte: start, lte: end },
          type: TransactionType.SALE,
        },
      },
      include: {
        item: {
          select: { name: true }
        }
      }
    });

    // Item breakdown for reconciliation
    const itemMap = new Map<number, { name: string; quantity: number; revenue: number }>();
    
    // Cache average costs to avoid repetitive DB hits
    const costCache = new Map<number, number>();
    for (const item of saleItems) {
      if (!costCache.has(item.itemId)) {
        costCache.set(item.itemId, await this.purchasesService.calculateAverageCost(item.itemId));
      }
      totalCOGS += (costCache.get(item.itemId) || 0) * item.quantity;

      // Aggregating for itemBreakdown
      const existing = itemMap.get(item.itemId) || { name: item.item.name, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += Number(item.subtotal);
      itemMap.set(item.itemId, existing);
    }

    const itemBreakdown = Array.from(itemMap.entries()).map(([itemId, data]) => ({
      itemId,
      ...data,
      revenue: Number(data.revenue.toFixed(2))
    }));

    // Spin rewards items & cost
    const spinRewards = await this.prisma.inventoryMovements.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        type: MovementType.SPIN_REWARD,
      },
      include: {
        item: {
          select: { name: true },
        },
      },
    });

    const spinItemMap = new Map<number, { name: string; quantity: number }>();
    let marketingCost = 0;

    for (const reward of spinRewards) {
      if (!costCache.has(reward.itemId)) {
        costCache.set(
          reward.itemId,
          await this.purchasesService.calculateAverageCost(reward.itemId),
        );
      }
      marketingCost +=
        (costCache.get(reward.itemId) || 0) * Math.abs(reward.quantityChange);

      // Aggregating for spinBreakdown
      const existing = spinItemMap.get(reward.itemId) || {
        name: reward.item.name,
        quantity: 0,
      };
      existing.quantity += Math.abs(reward.quantityChange);
      spinItemMap.set(reward.itemId, existing);
    }

    const spinBreakdown = Array.from(spinItemMap.entries()).map(
      ([itemId, data]) => ({
        itemId,
        ...data,
      }),
    );

    return {
      date: start,
      endDate: end,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      salesRevenue: Number(salesRevenue.toFixed(2)),
      salesCount,
      spinRevenue: Number(spinRevenue.toFixed(2)),
      spinCount,
      totalTips: Number(totalTips.toFixed(2)),
      grossProfit: Number(
        (totalRevenue - totalCOGS - marketingCost).toFixed(2),
      ),
      totalCOGS: Number(totalCOGS.toFixed(2)),
      marketingCost: Number(marketingCost.toFixed(2)),
      paymentBreakdown: {
        CASH: Number(paymentBreakdown.CASH.toFixed(2)),
        TELEBIRR: Number(paymentBreakdown.TELEBIRR.toFixed(2)),
        CBE: Number(paymentBreakdown.CBE.toFixed(2)),
      },
      tipBreakdown: {
        CASH: Number(tipBreakdown.CASH.toFixed(2)),
        TELEBIRR: Number(tipBreakdown.TELEBIRR.toFixed(2)),
        CBE: Number(tipBreakdown.CBE.toFixed(2)),
      },
      itemBreakdown,
      spinBreakdown,
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
