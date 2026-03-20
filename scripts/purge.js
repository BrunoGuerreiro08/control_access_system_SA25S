import prisma from '../src/lib/prisma.js'

async function clearDB() {
  console.log('Clearing database...')
  await prisma.resource.deleteMany()
  await prisma.user.deleteMany()

  console.log('Done! Database cleared!')
}

clearDB()
.catch(console.error)
.finally(() => prisma.$disconnect())