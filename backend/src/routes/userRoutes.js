import express from "express";
import {
  createUser,
  getLeaderboard,
  getUserById,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);

router.get("/leaderboard", getLeaderboard);

router.get("/:id", getUserById);

export default router;
