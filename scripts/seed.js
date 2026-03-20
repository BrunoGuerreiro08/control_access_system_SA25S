// scripts/seed.js
import prisma from '../src/lib/prisma.js'
import bcrypt from 'bcrypt'
import { LEVELS } from '../src/utils/securityLevels.js'

async function seed() {
  console.log('Clearing database...')
  await prisma.resource.deleteMany()
  await prisma.user.deleteMany()

  console.log('Creating users...')
  await prisma.user.createMany({
    data: [
      {
        username: 'alice',
        password: await bcrypt.hash('alice123', 10),
        clearanceLevel: LEVELS.UNCLASSIFIED
      },
      {
        username: 'bob',
        password: await bcrypt.hash('bob123', 10),
        clearanceLevel: LEVELS.SECRET
      },
      {
        username: 'charlie',
        password: await bcrypt.hash('charlie123', 10),
        clearanceLevel: LEVELS.TOP_SECRET
      }
    ]
  })

  console.log('Creating resources...')
  await prisma.resource.createMany({
    data: [
      { content: 'Public announcement board',         classificationLevel: LEVELS.UNCLASSIFIED },
      { content: 'General operational guidelines',    classificationLevel: LEVELS.UNCLASSIFIED },
      { content: 'Staff contact directory',           classificationLevel: LEVELS.UNCLASSIFIED },
      { content: 'Internal budget overview',          classificationLevel: LEVELS.CONFIDENTIAL },
      { content: 'HR performance reviews',            classificationLevel: LEVELS.CONFIDENTIAL },
      { content: 'Vendor contracts summary',          classificationLevel: LEVELS.CONFIDENTIAL },
      { content: 'Network infrastructure diagram',    classificationLevel: LEVELS.SECRET },
      { content: 'Incident response playbook',        classificationLevel: LEVELS.SECRET },
      { content: 'Undercover operative locations',    classificationLevel: LEVELS.TOP_SECRET },
      { content: 'Nuclear facility access codes',     classificationLevel: LEVELS.TOP_SECRET },
    ]
  })

  console.log('Done! Users: alice (UNCLASSIFIED), bob (SECRET), charlie (TOP_SECRET)')
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())