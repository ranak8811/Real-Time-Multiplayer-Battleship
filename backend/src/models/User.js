import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
    },

    gamesPlayed: {
      type: Number,
      default: 0,
    },

    wins: {
      type: Number,
      default: 0,
    },

    losses: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
