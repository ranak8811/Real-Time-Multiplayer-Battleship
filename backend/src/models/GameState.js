import mongoose from "mongoose";

const positionSchema = new mongoose.Schema(
  {
    row: { type: Number, required: true },
    col: { type: Number, required: true },
  },
  { _id: false },
);

const shipSchema = new mongoose.Schema(
  {
    shipId: { type: String, required: true },
    size: { type: Number, required: true },
    positions: [positionSchema],
    hits: [positionSchema],
  },
  { _id: false },
);

const gameStateSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameSession",
      required: true,
      unique: true,
    },

    player1Board: {
      type: [[String]],
      default: [],
    },

    player2Board: {
      type: [[String]],
      default: [],
    },

    player1Ships: [shipSchema],
    player2Ships: [shipSchema],

    currentTurn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    gameStatus: {
      type: String,
      required: true,
      enum: ["placement", "active", "finished"],
      default: "placement",
    },
  },
  { timestamps: true },
);

const GameState = mongoose.model("GameState", gameStateSchema);

export default GameState;
