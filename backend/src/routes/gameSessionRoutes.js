import express from "express";
import {
  createSession,
  getSessionById,
  getSessions,
  joinSession,
  placeShips,
} from "../controllers/gameSessionController.js";

const router = express.Router();

router.post("/", createSession);

router.get("/", getSessions);

router.post("/join", joinSession);

router.post("/place-ships", placeShips);

router.get("/:id", getSessionById);

export default router;
