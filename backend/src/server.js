import http from "http";
import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { Server } from "socket.io";
import { initializeSockets } from "./sockets/socketHandler.js";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initializeSockets(io);

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  Battleship Server is running on Port ${PORT}`);
  console.log(`=========================================`);
});
