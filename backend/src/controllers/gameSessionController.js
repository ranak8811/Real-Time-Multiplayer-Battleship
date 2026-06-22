import GameSession from "../models/GameSession.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import GameState from "../models/GameState.js";
import { validateShipPlacement } from "../utils/gameValidators.js";

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
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await GameSession.deleteMany({
      status: "waiting",
      createdAt: { $lt: twoHoursAgo },
    });

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const finishedSessions = await GameSession.find({
      status: "finished",
      updatedAt: { $lt: thirtyMinutesAgo },
    });

    const finishedSessionIds = finishedSessions.map((s) => s._id);
    if (finishedSessionIds.length > 0) {
      await GameState.deleteMany({ sessionId: { $in: finishedSessionIds } });
      await GameSession.deleteMany({ _id: { $in: finishedSessionIds } });
      console.log(
        `[Database Cleanup] Purged ${finishedSessionIds.length} stale finished sessions.`,
      );
    }

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

    const createEmptyBoard = (size) => {
      const board = [];

      for (let i = 0; i < size; i++) {
        board.push(Array(size).fill("empty"));
      }

      return board;
    };

    const existingState = await GameState.findOne({ sessionId: session._id });

    if (!existingState) {
      await GameState.create({
        sessionId: session._id,
        player1Board: createEmptyBoard(session.gridSize),
        player2Board: createEmptyBoard(session.gridSize),
        player1Ships: [],
        player2Ships: [],
        currentTurn: session.ownerId,
        gameStatus: "placement",
      });
    }

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

export const placeShips = async (req, res) => {
  try {
    const { sessionId, userId, ships } = req.body;

    if (!sessionId || !userId || !ships) {
      return res.status(400).json({
        success: false,
        message: "Session ID, User ID, and ships configurations are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(sessionId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Session ID or User ID format",
      });
    }

    const session = await GameSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Game session not found",
      });
    }

    if (session.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message:
          "Game session is not in progress. Ensure 2 players have joined.",
      });
    }

    const gameState = await GameState.findOne({ sessionId });
    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found for this session",
      });
    }

    if (gameState.gameStatus !== "placement") {
      return res.status(400).json({
        success: false,
        message: "Ships have already been placed and match is active/finished",
      });
    }

    let playerRole = "";

    if (session.ownerId.toString() === userId.toString()) {
      playerRole = "player1";
    } else if (
      session.opponentId &&
      session.opponentId.toString() === userId.toString()
    ) {
      playerRole = "player2";
    } else {
      return res.status(403).json({
        success: false,
        message: "User is not a participant in this game session",
      });
    }

    const validation = validateShipPlacement(
      ships,
      session.gridSize,
      session.shipConfig,
    );
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const board = gameState[`${playerRole}Board`];

    for (let r = 0; r < session.gridSize; r++) {
      for (let c = 0; c < session.gridSize; c++) {
        board[r][c] = "empty";
      }
    }

    for (const ship of ships) {
      for (const pos of ship.positions) {
        board[pos.row][pos.col] = "ship";
      }
    }

    gameState[`${playerRole}Ships`] = ships;
    gameState[`${playerRole}Board`] = board;

    const otherRole = playerRole === "player1" ? "player2" : "player1";
    const otherShips = gameState[`${otherRole}Ships`];

    let gameStarted = false;

    if (otherShips && otherShips.length > 0) {
      gameState.gameStatus = "active";
      gameStarted = true;

      const io = req.app.get("io");

      if (io) {
        io.to(session.roomCode.trim().toUpperCase()).emit("match-start", {
          sessionId: session._id,
          message: "Both fleets are locked in. The battle commences!",
        });
      }
    }

    gameState.markModified(`${playerRole}Board`);

    await gameState.save();

    return res.status(200).json({
      success: true,
      message: "Ships placed and validated successfully",
      gameStatus: gameState.gameStatus,
      gameStarted,
    });
  } catch (error) {
    console.error("Error in placeShips:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while submitting ship placements",
    });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Session ID format",
      });
    }

    const session = await GameSession.findById(id)
      .populate("ownerId", "displayName")
      .populate("opponentId", "displayName");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Game session not found",
      });
    }

    const gameState = await GameState.findOne({ sessionId: id });

    return res.status(200).json({
      success: true,
      session,
      gameState,
    });
  } catch (error) {
    console.error("Error in getSessionById:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while retrieving session details",
    });
  }
};

export const fireShot = async (req, res) => {
  try {
    const { sessionId, userId, row, col } = req.body;

    if (!sessionId || !userId || row === undefined || col === undefined) {
      return res.status(400).json({
        success: false,
        message: "Session ID, User ID, and coordinates (row, col) are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(sessionId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Session ID or User ID format",
      });
    }

    const session = await GameSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Game session not found",
      });
    }

    if (session.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Game session is not active",
      });
    }

    const gameState = await GameState.findOne({ sessionId });
    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found",
      });
    }

    if (gameState.gameStatus !== "active") {
      return res.status(400).json({
        success: false,
        message: "Match is not currently in active gameplay mode",
      });
    }

    if (gameState.currentTurn.toString() !== userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "It is not your turn to make a move",
      });
    }

    if (
      row < 0 ||
      row >= session.gridSize ||
      col < 0 ||
      col >= session.gridSize
    ) {
      return res.status(400).json({
        success: false,
        message: `Coordinates are out of bounds (Grid size is ${session.gridSize}x${session.gridSize})`,
      });
    }

    const attackerRole =
      session.ownerId.toString() === userId.toString() ? "player1" : "player2";
    const defenderRole = attackerRole === "player1" ? "player2" : "player1";

    const defenderBoard = gameState[`${defenderRole}Board`];
    const targetCell = defenderBoard[row][col];

    if (targetCell === "hit" || targetCell === "miss") {
      return res.status(400).json({
        success: false,
        message: "You have already attacked this coordinate",
      });
    }

    let isHit = false;
    let sunkShipId = null;

    if (targetCell === "ship") {
      isHit = true;
      defenderBoard[row][col] = "hit";

      const defenderShips = gameState[`${defenderRole}Ships`];
      for (const ship of defenderShips) {
        const isPart = ship.positions.some(
          (pos) => pos.row === row && pos.col === col,
        );
        if (isPart) {
          const alreadyHit = ship.hits.some(
            (h) => h.row === row && h.col === col,
          );
          if (!alreadyHit) {
            ship.hits.push({ row, col });
          }

          if (ship.hits.length === ship.size) {
            sunkShipId = ship.shipId;
          }
          break;
        }
      }
    } else {
      defenderBoard[row][col] = "miss";
    }

    const defenderShips = gameState[`${defenderRole}Ships`];
    const allSunk = defenderShips.every(
      (ship) => ship.hits.length === ship.size,
    );

    if (allSunk) {
      gameState.gameStatus = "finished";
      gameState.winner = userId;
      session.status = "finished";
      await session.save();

      await User.findByIdAndUpdate(userId, {
        $inc: { wins: 1, gamesPlayed: 1 },
      });

      const loserId =
        session.ownerId.toString() === userId.toString()
          ? session.opponentId
          : session.ownerId;

      await User.findByIdAndUpdate(loserId, {
        $inc: { losses: 1, gamesPlayed: 1 },
      });
    } else {
      gameState.currentTurn =
        attackerRole === "player1" ? session.opponentId : session.ownerId;
    }

    gameState.markModified(`${defenderRole}Board`);
    gameState.markModified(`${defenderRole}Ships`);
    await gameState.save();

    const io = req.app.get("io");
    if (io) {
      io.to(session.roomCode.trim().toUpperCase()).emit("shot-fired", {
        gameState,
        attackerId: userId,
        row,
        col,
        result: isHit ? "hit" : "miss",
        sunkShip: sunkShipId,
        winnerId: gameState.winner || null,
      });
    }

    return res.status(200).json({
      success: true,
      message: isHit ? "Hit!" : "Miss!",
      result: isHit ? "hit" : "miss",
      sunkShip: sunkShipId,
      winnerId: gameState.winner || null,
    });
  } catch (error) {
    console.error("Error in fireShot:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while executing fire strike",
    });
  }
};
