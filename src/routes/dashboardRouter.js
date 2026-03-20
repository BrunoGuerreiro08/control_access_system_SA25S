import express from 'express';
import {dashboardControler} from "../controllers/dashboardControler.js";

const router = express.Router();

router.get("/dashboard", dashboardControler);

export default router;