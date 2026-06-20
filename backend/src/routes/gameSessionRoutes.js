import express from "express";
import {
  createSession,
  getSessions,
  joinSession,
} from "../controllers/gameSessionController.js";

const router = express.Router();

router.post("/", createSession);

router.get("/", getSessions);

router.post("/join", joinSession);

export default router;
