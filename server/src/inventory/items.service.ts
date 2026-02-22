import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Items, Prisma } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ItemsCreateInput): Promise<Items> {
    return this.prisma.items.create({
      data,
    });
  }

  async findAll(): Promise<Items[]> {
    return this.prisma.items.findMany({
      where: { isActive: true },
      include: {
        prices: {
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });
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
    return this.prisma.items.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Items> {
    return this.prisma.items.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
