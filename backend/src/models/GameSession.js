import mongoose from "mongoose";

const gameSessionSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: [true, "Room code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 6,
      maxlength: 6,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Session owner (creator) is required"],
    },

    opponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    gridSize: {
      type: Number,
      required: true,
      enum: [5, 8, 10, 12, 15],
      default: 10,
    },

    shipConfig: {
      carrier: { type: Number, default: 1 },
      battleship: { type: Number, default: 2 },
      destroyer: { type: Number, default: 3 },
      patrolBoat: { type: Number, default: 4 },
    },

    status: {
      type: String,
      required: true,
      enum: ["waiting", "in_progress", "finished"],
      default: "waiting",
    },
  },
  {
    timestamps: true,
  },
);

const GameSession = mongoose.model("GameSession", gameSessionSchema);

export default GameSession;
