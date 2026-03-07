import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovementType } from '@prisma/client';

@Injectable()
export class DevService {
  constructor(private readonly prisma: PrismaService) {}

  async resetAllInventoryStock(): Promise<{ message: string; count: number }> {
    const items = await this.prisma.items.findMany({
      where: { isActive: true },
    });

    let resetCount = 0;

    for (const item of items) {
      const stockAgg = await this.prisma.inventoryMovements.aggregate({
        where: { itemId: item.id },
        _sum: { quantityChange: true },
      });
      
      const currentStock = stockAgg._sum.quantityChange || 0;
      
      if (currentStock !== 0) {
        await this.prisma.inventoryMovements.create({
          data: {
            itemId: item.id,
            type: MovementType.ADJUSTMENT,
            quantityChange: -currentStock,
          },
        });
        resetCount++;
      }
    }

    return { 
      message: `Successfully reset stock to 0 for ${resetCount} items.`, 
      count: resetCount 
    };
  }
}