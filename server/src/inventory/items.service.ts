import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Items, Prisma, MovementType } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ItemsCreateInput & { initialQuantity?: number }): Promise<Items> {
    const { initialQuantity, ...itemData } = data;

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
}
