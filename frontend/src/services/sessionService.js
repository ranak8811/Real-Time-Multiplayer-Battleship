import axiosClient from "../api/axiosClient";

export const getSessions = async () => {
  try {
    const response = await axiosClient.get("/sessions");
    return response.data;
  } catch (error) {
    console.error("Error in getSessions service:", error);
    throw error.response?.data?.message || "Failed to load active battle rooms";
  }
};

export const createSession = async (ownerId, gridSize) => {
  try {
    const response = await axiosClient.post("/sessions", { ownerId, gridSize });
    return response.data;
  } catch (error) {
    console.error("Error in createSession service:", error);
    throw error.response?.data?.message || "Failed to create game room";
  }
};

export const joinSession = async (roomCode, opponentId) => {
  try {
    const response = await axiosClient.post("/sessions/join", {
      roomCode,
      opponentId,
    });
    return response.data;
  } catch (error) {
    console.error("Error in joinSession service:", error);
    throw error.response?.data?.message || "Failed to join game room";
  }
};
