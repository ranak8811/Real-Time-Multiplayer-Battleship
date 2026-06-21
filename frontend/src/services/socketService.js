import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.io.opts.query = { userId };
    socket.connect();
    console.log("Socket successfully connected for User ID:", userId);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("Socket disconnected from server");
  }
};
