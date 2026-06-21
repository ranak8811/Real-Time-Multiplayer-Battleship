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

    socket.on("disconnect", () => {
      console.log(
        `[Socket] Player Disconnected. Socket ID: ${socket.id}, User ID: ${userId || "Anonymous"}`,
      );
    });
  });
};
