import GameSession from "../models/GameSession.js";
import mongoose from "mongoose";
import User from "../models/User.js";

const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
};

export const createSession = async (req, res) => {
  try {
    const { ownerId, gridSize, shipConfig } = req.body;

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: "Owner ID is required to create a game session",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Owner ID format",
      });
    }

    const ownerExists = await User.findById(ownerId);
    if (!ownerExists) {
      return res.status(404).json({
        success: false,
        message: "Session owner user not found",
      });
    }

    if (gridSize && ![8, 10, 12, 15].includes(Number(gridSize))) {
      return res.status(400).json({
        success: false,
        message: "Grid size must be 8, 10, 12, or 15",
      });
    }

    let roomCode = "";
    let isUnique = false;

    while (!isUnique) {
      roomCode = generateRoomCode();

      const existingSession = await GameSession.findOne({ roomCode });
      if (!existingSession) {
        isUnique = true;
      }
    }

    const newSession = await GameSession.create({
      roomCode,
      ownerId,
      gridSize: gridSize ? Number(gridSize) : 10,
      shipConfig: shipConfig || {
        carrier: 1,
        battleship: 2,
        destroyer: 3,
        patrolBoat: 4,
      },
      status: "waiting",
    });

    return res.status(201).json({
      success: true,
      sessionId: newSession._id,
      roomCode: newSession.roomCode,
      gridSize: newSession.gridSize,
      status: newSession.status,
      owner: {
        userId: ownerExists._id,
        displayName: ownerExists.displayName,
      },
    });
  } catch (error) {
    console.error("Error in createSession controller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while creating game session",
    });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await GameSession.find({ status: "waiting" })
      .populate("ownerId", "displayName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error("Error in getSessions:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while retrieving sessions list",
    });
  }
};

export const joinSession = async (req, res) => {
  try {
    const { roomCode, opponentId } = req.body;

    if (!roomCode || !opponentId) {
      return res.status(400).json({
        success: false,
        message: "Room code and Opponent ID are required to join",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(opponentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Opponent ID format",
      });
    }

    const opponentExists = await User.findById(opponentId);
    if (!opponentExists) {
      return res.status(404).json({
        success: false,
        message: "Opponent user not found",
      });
    }

    const session = await GameSession.findOne({
      roomCode: roomCode.trim().toUpperCase(),
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Game room with this code not found",
      });
    }

    if (session.status !== "waiting") {
      return res.status(400).json({
        success: false,
        message: "Room is already full or the game has finished",
      });
    }

    if (session.ownerId.toString() === opponentId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot play against yourself. Please join another room!",
      });
    }

    session.opponentId = opponentId;
    session.status = "in_progress";
    await session.save();

    const updatedSession = await GameSession.findById(session._id)
      .populate("ownerId", "displayName")
      .populate("opponentId", "displayName");

    return res.status(200).json({
      success: true,
      message: "Joined room successfully",
      session: {
        sessionId: updatedSession._id,
        roomCode: updatedSession.roomCode,
        gridSize: updatedSession.gridSize,
        status: updatedSession.status,
        owner: {
          userId: updatedSession.ownerId._id,
          displayName: updatedSession.ownerId.displayName,
        },
        opponent: {
          userId: updatedSession.opponentId._id,
          displayName: updatedSession.opponentId.displayName,
        },
      },
    });
  } catch (error) {
    console.error("Error in joinSession:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while joining the room",
    });
  }
};
