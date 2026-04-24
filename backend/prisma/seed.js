const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@smartseason.com' },
    update: {},
    create: {
      email: 'admin@smartseason.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'ADMIN',
    },
  });
  console.log('Database seeded with admin user.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
