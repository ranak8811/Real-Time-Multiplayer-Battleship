import express from "express";
import {
  createSession,
  getSessions,
  joinSession,
  placeShips,
} from "../controllers/gameSessionController.js";

const router = express.Router();

router.post("/", createSession);

router.get("/", getSessions);

router.post("/join", joinSession);

router.post("/place-ships", placeShips);

export default router;
