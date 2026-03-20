import express from 'express';
import {createResource, getResource} from "../controllers/resourceControler.js";
import authMiddleware from '../middlewares/authMiddleware.js';
import { LEVELS } from '../utils/securityLevels.js';

const router = express.Router();

router.post('/resource/create', authMiddleware, createResource)

router.get('/resource/create', authMiddleware, (req, res) => {
  res.render('newResource.ejs', { error: null, levels: LEVELS })
})

router.get('/resource/:id', authMiddleware, getResource)


export default router;