const { PrismaClient, UserStatus, Role } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPhone = process.env.ADMIN_PHONE || '0911223344';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {
      password: hashedPassword,
      status: UserStatus.APPROVED,
      role: Role.ADMIN,
    },
    create: {
      phone: adminPhone,
      name: 'System Admin',
      password: hashedPassword,
      role: Role.ADMIN,
      status: UserStatus.APPROVED,
    },
  });
  console.log('Admin created/updated:', admin.phone);

  // 2. Create Items
  const items = [
    { name: 'Water 500ml', sku: 'WTR500' },
    { name: 'Coca Cola 300ml', sku: 'COKE300' },
  ];

  for (const itemData of items) {
    const item = await prisma.items.upsert({
      where: { sku: itemData.sku },
      update: {},
      create: itemData,
    });
    console.log('Item created:', item.name);

    // 3. Set Initial Price
    await prisma.itemPrices.create({
      data: {
        itemId: item.id,
        price: 15.0,
        effectiveFrom: new Date(),
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
