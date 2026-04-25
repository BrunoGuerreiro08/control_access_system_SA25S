import express from "express";
import { searchUsers } from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only authenticated users reach this — authMiddleware checks req.isAuthenticated()
// Further clearance check (TOP SECRET only) is enforced inside the controller
router.get("/users", authMiddleware, searchUsers);

export default router;
