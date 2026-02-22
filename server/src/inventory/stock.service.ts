import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryMovements, MovementType, Prisma } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async createMovement(data: {
    itemId: number;
    type: MovementType;
    quantityChange: number;
    referenceId?: number;
    referenceType?: string;
  }): Promise<InventoryMovements> {
    return this.prisma.inventoryMovements.create({
      data: {
        itemId: data.itemId,
        type: data.type,
        quantityChange: data.quantityChange,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
      },
    });
  }

  async calculateStock(itemId: number): Promise<number> {
    const aggregations = await this.prisma.inventoryMovements.aggregate({
      where: { itemId },
      _sum: {
        quantityChange: true,
      },
    });
    return aggregations._sum.quantityChange || 0;
  }

  async getMovements(itemId: number): Promise<InventoryMovements[]> {
    return this.prisma.inventoryMovements.findMany({
      where: { itemId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
