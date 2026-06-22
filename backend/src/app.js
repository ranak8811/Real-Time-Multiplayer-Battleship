import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import gameSessionRoutes from "./routes/gameSessionRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use("/api/users", userRoutes);
app.use("/api/sessions", gameSessionRoutes);

app.get("/", (req, res) => {
  res.send("Battleship Game API is running successfully...");
});

export default app;
