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
