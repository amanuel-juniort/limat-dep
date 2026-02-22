import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ItemPrices, Prisma } from '@prisma/client';

@Injectable()
export class PricesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { itemId: number; price: number }): Promise<ItemPrices> {
    const now = new Date();

    // Transaction to ensure atomicity: close old price and open new one
    return this.prisma.$transaction(async (tx) => {
      // 1. Close current active price
      await tx.itemPrices.updateMany({
        where: {
          itemId: data.itemId,
          effectiveTo: null,
        },
        data: {
          effectiveTo: now,
        },
      });

      // 2. Create new active price
      return tx.itemPrices.create({
        data: {
          itemId: data.itemId,
          price: new Prisma.Decimal(data.price),
          effectiveFrom: now,
          effectiveTo: null,
        },
      });
    });
  }

  async findCurrentPrice(itemId: number): Promise<ItemPrices | null> {
    return this.prisma.itemPrices.findFirst({
      where: {
        itemId,
        effectiveTo: null,
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
    });
  }

  async findHistory(itemId: number): Promise<ItemPrices[]> {
    return this.prisma.itemPrices.findMany({
      where: { itemId },
      orderBy: { effectiveFrom: 'desc' },
    });
  }
}
