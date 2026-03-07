import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Items, Prisma, MovementType } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  

  async create(data: Prisma.ItemsCreateInput & { initialQuantity?: number }): Promise<Items> {
    const { initialQuantity, ...itemData } = data;

    // Auto-generate short SKU if not provided
    if (!itemData.sku || itemData.sku.trim() === '') {
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      itemData.sku = `SKU-${randomPart}`;
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const item = await tx.items.create({
          data: {
            ...itemData,
            isActive: itemData.isActive ?? true,
          },
        });

        if (initialQuantity && initialQuantity > 0) {
          await tx.inventoryMovements.create({
            data: {
              itemId: item.id,
              type: MovementType.ADJUSTMENT,
              quantityChange: initialQuantity,
            },
          });
        }

        return item;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('An item with this SKU already exists.');
      }
      throw error;
    }
  }

  async findAll(): Promise<any[]> {
    const items = await this.prisma.items.findMany({
      where: { isActive: true },
      include: {
        prices: {
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });

    // Add totalStock for each item
    return Promise.all(
      items.map(async (item) => {
        const stock = await this.prisma.inventoryMovements.aggregate({
          where: { itemId: item.id },
          _sum: { quantityChange: true },
        });
        return {
          ...item,
          totalStock: stock._sum.quantityChange || 0,
        };
      }),
    );
  }

  async findOne(id: number): Promise<Items> {
    const item = await this.prisma.items.findUnique({
      where: { id },
      include: {
        prices: {
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: number, data: Prisma.ItemsUpdateInput): Promise<Items> {
    // Auto-generate short SKU if cleared
    if (data.sku !== undefined && (!data.sku || (typeof data.sku === 'string' && data.sku.trim() === ''))) {
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      data.sku = `SKU-${randomPart}`;
    }

    try {
      return await this.prisma.items.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('An item with this SKU already exists.');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<Items> {
    return this.prisma.items.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async setStockLevel(id: number, targetQuantity: number): Promise<any> {
    const stockAgg = await this.prisma.inventoryMovements.aggregate({
      where: { itemId: id },
      _sum: { quantityChange: true },
    });
    
    const currentStock = stockAgg._sum.quantityChange || 0;
    const delta = targetQuantity - currentStock;

    if (delta === 0) return { message: 'No change required' };

    return this.prisma.inventoryMovements.create({
      data: {
        itemId: id,
        type: MovementType.ADJUSTMENT,
        quantityChange: delta,
      },
    });
  }

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
