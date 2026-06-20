import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import gameSessionRoutes from "./routes/gameSessionRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/sessions", gameSessionRoutes);

app.get("/", (req, res) => {
  res.send("Battleship Game API is running successfully...");
});

export default app;
