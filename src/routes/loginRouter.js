import express from 'express';
import {loginControler} from "../controllers/loginControler.js";

const router = express.Router();

router.get("/login", (req, res) => {
  res.render('login.ejs', { username: ''})
});

router.post("/login", loginControler);

router.get('/logout', (req, res) => {
  logger.info({ userId: req.user.id, username: req.user.username }, 'User logged out')
  res.clearCookie('token')
  res.redirect('/login')
})

export default router;