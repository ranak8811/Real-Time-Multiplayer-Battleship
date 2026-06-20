import GameSession from "../models/GameSession.js";

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
