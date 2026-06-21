import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";

export const getSessions = async () => {
  try {
    const response = await axiosClient.get("/sessions");
    return response.data;
  } catch (error) {
    console.error("Error in getSessions service:", error);

    toast.error(
      error.response?.data?.message || "Failed to load active battle rooms",
    );
  }
};

export const createSession = async (ownerId, gridSize) => {
  try {
    const response = await axiosClient.post("/sessions", { ownerId, gridSize });
    return response.data;
  } catch (error) {
    console.error("Error in createSession service:", error);

    toast.error(error.response?.data?.message || "Failed to create game room");
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

    toast.error(error.response?.data?.message || "Failed to join game room");
  }
};

export const getSessionById = async (sessionId) => {
  try {
    const response = await axiosClient.get(`/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error in getSessionById service:", error);
    toast.error(
      error.response?.data?.message || "Failed to load battle room details",
    );
  }
};

export const placeShips = async (sessionId, userId, ships) => {
  try {
    const response = await axiosClient.post("/sessions/place-ships", {
      sessionId,
      userId,
      ships,
    });
    return response.data;
  } catch (error) {
    console.error("Error in placeShips service:", error);
    throw error.response?.data?.message || "Failed to submit ship placements";
  }
};
