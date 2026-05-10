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

  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      title: 'Summer in Europe 2026',
      startDate: new Date('2026-06-15'),
      endDate: new Date('2026-06-30'),
      budget: 5000,
      isPublic: true,
      description: 'A grand tour through Paris, Swiss Alps, and Rome.',
      imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
      stops: {
        create: [
          {
            order: 1,
            arrival: new Date('2026-06-15'),
            departure: new Date('2026-06-20'),
            budget: 2000,
            city: {
              create: { name: 'Paris', country: 'France' }
            },
            activities: {
              create: [
                { name: 'Eiffel Tower Sunrise', plannedTime: '06:00', cost: 50, order: 1 },
                { name: 'Louvre Museum Tour', plannedTime: '10:00', cost: 30, order: 2 }
              ]
            }
          },
          {
            order: 2,
            arrival: new Date('2026-06-20'),
            departure: new Date('2026-06-25'),
            budget: 1500,
            city: {
              create: { name: 'Interlaken', country: 'Switzerland' }
            },
            activities: {
              create: [
                { name: 'Paragliding', plannedTime: '11:00', cost: 200, order: 1 },
                { name: 'Swiss Fondue Dinner', plannedTime: '19:00', cost: 80, order: 2 }
              ]
            }
          }
        ]
      }
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