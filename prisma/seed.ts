import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@shop.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
      },
    });

    // eslint-disable-next-line no-console
    console.log(`Seeded admin user: ${adminEmail}`);
  } else {
    // eslint-disable-next-line no-console
    console.log('Admin user already exists. Skipping admin seed.');
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          name: 'Gaming Laptop',
          description: 'High-performance gaming laptop with RTX GPU',
          price: 1499.99,
          stock: 25,
          imageUrl: 'https://example.com/laptop.jpg',
        },
        {
          name: 'Wireless Headphones',
          description: 'Noise-cancelling Bluetooth headphones',
          price: 199.99,
          stock: 100,
          imageUrl: 'https://example.com/headphones.jpg',
        },
      ],
    });

    // eslint-disable-next-line no-console
    console.log('Seeded sample products.');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
