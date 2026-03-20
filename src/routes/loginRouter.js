import express from 'express';
import logger from '../lib/logger.js'
import {loginControler} from "../controllers/loginControler.js";

const router = express.Router();

router.get("/login", (req, res) => {
  res.render('login.ejs', { username: ''})
});

router.post("/login", loginControler);

router.get('/logout', (req, res) => {
  if (req.user) {
    logger.info({ userId: req.user.id, username: req.user.username }, 'User logged out')
  } else {
    logger.warn({ token: req.cookies?.token ?? 'none' }, 'Logout with missing or expired token')
  }
  res.clearCookie('token')
  res.redirect('/login')
})

export default router;