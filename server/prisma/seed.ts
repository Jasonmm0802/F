import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create a Store User
  const store = await prisma.user.upsert({
    where: { email: 'store@example.com' },
    update: {},
    create: {
      email: 'store@example.com',
      password: 'password123', // In real app, this should be hashed
      name: '全家校園店',
      role: 'STORE',
      lat: 25.0330,
      lng: 121.5654,
    },
  });

  // Create a Canteen User
  const canteen = await prisma.user.upsert({
    where: { email: 'canteen@example.com' },
    update: {},
    create: {
      email: 'canteen@example.com',
      password: 'password123',
      name: '第一學餐',
      role: 'STORE',
      lat: 25.0400,
      lng: 121.5700,
    },
  });

  // Create an Event User (Organizers can be STORE role)
  const event = await prisma.user.upsert({
    where: { email: 'event@example.com' },
    update: {},
    create: {
      email: 'event@example.com',
      password: 'password123',
      name: '學生會活動組',
      role: 'STORE',
      lat: 25.0350,
      lng: 121.5600,
    },
  });

  // Seed Food Items
  const now = new Date();
  
  await prisma.foodItem.createMany({
    data: [
      {
        name: '御飯糰組合',
        category: 'STORE',
        price: 45,
        expiryDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        storeId: store.id,
        status: 'AVAILABLE',
      },
      {
        name: '排骨便當',
        category: 'CANTEEN',
        price: 80,
        expiryDate: new Date(now.getTime() + 0.5 * 60 * 60 * 1000), // 0.5 hours later (Yellow)
        storeId: canteen.id,
        status: 'AVAILABLE',
      },
      {
        name: '會議茶點 (三明治)',
        category: 'EVENT',
        price: 0,
        expiryDate: new Date(now.getTime() + 5 * 60 * 60 * 1000), // 5 hours later
        storeId: event.id,
        status: 'AVAILABLE',
      },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
