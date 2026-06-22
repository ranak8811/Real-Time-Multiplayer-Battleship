import express from "express";
import {
  createUser,
  getLeaderboard,
  getUserById,
  loginUserByName,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);

router.post("/login", loginUserByName);

router.get("/leaderboard", getLeaderboard);

router.get("/:id", getUserById);

export default router;
