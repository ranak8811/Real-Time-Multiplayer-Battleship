import GameSession from "../models/GameSession.js";
import GameState from "../models/GameState.js";
import User from "../models/User.js";

const handlePlayerExit = async (userId, roomCode, io) => {
  try {
    if (!roomCode || !userId) return;

    const formattedRoom = roomCode.trim().toUpperCase();

    const session = await GameSession.findOne({
      roomCode: formattedRoom,
      status: "in_progress",
    });

    if (!session) return;

    let winnerId = null;

    if (session.ownerId.toString() === userId.toString()) {
      winnerId = session.opponentId;
    } else if (
      session.opponentId &&
      session.opponentId.toString() === userId.toString()
    ) {
      winnerId = session.ownerId;
    }

    if (!winnerId) return;

    session.status = "finished";
    await session.save();

    const gameState = await GameState.findOne({ sessionId: session._id });

    if (gameState && gameState.gameStatus !== "finished") {
      gameState.gameStatus = "finished";
      gameState.winner = winnerId;

      await gameState.save();

      await User.findByIdAndUpdate(winnerId, {
        $inc: { wins: 1, gamesPlayed: 1 },
      });

      const loserId = userId;
      await User.findByIdAndUpdate(loserId, {
        $inc: { losses: 1, gamesPlayed: 1 },
      });

      console.log(
        `[Socket Game Over] Winner by forfeit: ${winnerId} in Room: ${formattedRoom}`,
      );

      io.to(formattedRoom).emit("opponent-left", {
        gameState,
        winnerId,
        message: "Your opponent disconnected or retreated. You win by forfeit!",
      });
    }
  } catch (error) {
    console.error("Error in handlePlayerExit:", error);
  }
};

export const initializeSockets = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    console.log(
      `[Socket] Player Connected. Socket ID: ${socket.id}, User ID: ${userId || "Anonymous"}`,
    );

    socket.on("join-room", (data) => {
      const { roomCode, userId } = data;

      if (!roomCode) {
        console.error(`[Socket] join-room error: roomCode is missing`);
        return;
      }

      const formattedRoomCode = roomCode.trim().toUpperCase();

      socket.join(formattedRoomCode);
      console.log(
        `[Socket] Player ${userId || "Unknown"} entered Room: ${formattedRoomCode}`,
      );

      socket.to(formattedRoomCode).emit("player-joined-room", {
        userId,
        message: "Your opponent has joined the room.",
      });
    });

    socket.on("leave-room", async (data) => {
      const { roomCode, userId } = data;

      console.log(
        `[Socket Leave] User ${userId} requested to leave Room: ${roomCode}`,
      );

      await handlePlayerExit(userId, roomCode, io);
      socket.leave(roomCode.trim().toUpperCase());
    });

    socket.on("disconnecting", async () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          if (userId) {
            console.log(
              `[Socket Disconnecting] User ${userId} leaving Room: ${room}`,
            );
            await handlePlayerExit(userId, room, io);
          }
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(
        `[Socket] Player Disconnected. Socket ID: ${socket.id}, User ID: ${userId || "Anonymous"}`,
      );
    });
  });
};
