import bcrypt from 'bcrypt'
import prisma from '../lib/prisma.js'
import logger from '../lib/logger.js'

export const registerControler = async (req, res, next) => {
  try {
    const { username, password, clearanceLevel } = req.body

    if (!username || !password || clearanceLevel === undefined) {
      return res.render('register', { error: 'All fields are required', levels: undefined })
    }

    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      logger.warn({ username }, 'Registration attempt with existing username')
      return res.render('register', { error: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        clearanceLevel: parseInt(clearanceLevel)
      }
    })

    logger.info({ userId: user.id, username: user.username, clearanceLevel: user.clearanceLevel }, 'New user registered')

    res.redirect('/login')
  } catch (err) {
    logger.error({ err }, 'Unexpected error during registration')
    next(err)
  }
}