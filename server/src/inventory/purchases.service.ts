import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Purchases, MovementType, Prisma } from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: {
    supplierName?: string;
    invoiceNumber?: string;
    items: { itemId: number; quantity: number; unitCost: number }[];
  }): Promise<Purchases> {
    return this.prisma.$transaction(async (tx) => {
      let totalCost = 0;
      const purchaseItemsData: Prisma.PurchaseItemsCreateManyPurchaseInput[] = [];

      for (const item of data.items) {
        const subtotal = item.quantity * item.unitCost;
        totalCost += subtotal;

        purchaseItemsData.push({
          itemId: item.itemId,
          quantity: item.quantity,
          unitCost: new Prisma.Decimal(item.unitCost),
          subtotal: new Prisma.Decimal(subtotal),
        });
      }

      const purchase = await tx.purchases.create({
        data: {
          supplierName: data.supplierName,
          invoiceNumber: data.invoiceNumber,
          totalCost: new Prisma.Decimal(totalCost),
          userId,
          items: {
            create: purchaseItemsData,
          },
        },
      });

      // Create inventory movements
      for (const item of data.items) {
        await tx.inventoryMovements.create({
          data: {
            itemId: item.itemId,
            type: MovementType.PURCHASE,
            quantityChange: item.quantity,
            referenceId: purchase.id,
            referenceType: 'Purchases',
          },
        });
      }

      return purchase;
    });
  }

  async calculateAverageCost(itemId: number): Promise<number> {
    const aggregations = await this.prisma.purchaseItems.aggregate({
      where: { itemId },
      _sum: {
        quantity: true,
        subtotal: true,
      },
    });

    const totalQuantity = aggregations._sum.quantity || 0;
    const totalCost = Number(aggregations._sum.subtotal) || 0;

    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
  }
}
