import express from 'express';
import jwt from 'jsonwebtoken'
import passport from '../lib/passport.js'
import logger from '../lib/logger.js'

const router = express.Router();

// redirect to Google
router.get('/auth/google',
  passport.authenticate('google', 
    { scope: ['profile', 'email'], 
      prompt: 'select_account' 
    }
))

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {

    if (req.user._isNew) {
    logger.info({ userId: req.user.id, username: req.user.username }, 'New user registered via Google OAuth')
    } else {
    logger.info({ userId: req.user.id, username: req.user.username }, 'User logged in via Google OAuth')
    }

    const token = jwt.sign(
      { id: req.user.id, username: req.user.username, clearanceLevel: req.user.clearanceLevel },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    res.cookie('token', token, { httpOnly: true })
    res.redirect('/dashboard')
  }
)

export default router;