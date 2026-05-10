import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'admin@traveloop.com' },
    update: {},
    create: {
      email: 'admin@traveloop.com',
      passwordHash,
      firstName: 'Travel',
      lastName: 'Admin',
      city: 'San Francisco',
      country: 'USA',
    },
  })

  await prisma.trip.create({
    data: {
      userId: user.id,
      title: 'Summer in Europe',
      startDate: new Date('2026-06-15'),
      endDate: new Date('2026-06-30'),
      budget: 3500,
      isPublic: true,
    },
  })

  console.log('Dummy user and trip created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })