import bcrypt from 'bcrypt'
import dotenv from "dotenv";
import prisma from "../lib/prisma.js";
import jwt from 'jsonwebtoken'
import logger from '../lib/logger.js'

dotenv.config();

export const handleResponse = (res, status, message, data = null) => {
  return res.status(status).json({
    status,
    message,
    data,
  });
};

export const loginControler = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('login', { username: username? username : '', error: 'Missing login or password.' })
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      logger.warn({ username }, 'Failed login attempt: user not found')
      return res.render('login', { error: 'Invalid credentials', username })
    }

    // replace the plain comparison with:
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      logger.warn({ username }, 'Failed login attempt: wrong password')
      return res.render('login', { username: username, error: 'Invalid credentials' })
    }

    logger.info({ userId: user.id, username: user.username }, 'User logged in')

    const token = jwt.sign(
      { id: user.id, username: user.username, clearanceLevel: user.clearanceLevel },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.cookie('token', token, { httpOnly: true })

    res.redirect('/dashboard');

  } catch (err) {
    logger.error({ err }, 'Unexpected error during login')
    next(err);
  }
};