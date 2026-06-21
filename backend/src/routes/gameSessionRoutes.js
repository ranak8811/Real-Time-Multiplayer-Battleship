import express from "express";
import {
  createSession,
  getSessionById,
  getSessions,
  joinSession,
  placeShips,
  fireShot,
} from "../controllers/gameSessionController.js";

const router = express.Router();

router.post("/", createSession);

router.get("/", getSessions);

router.post("/join", joinSession);

router.post("/place-ships", placeShips);

router.post("/fire-shot", fireShot);

router.get("/:id", getSessionById);

export default router;
