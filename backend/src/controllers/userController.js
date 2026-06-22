import User from "../models/User.js";

export const createUser = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Display name is required",
      });
    }

    const trimmedName = name.trim();
    let uniqueName = trimmedName;
    let suffix = 2;

    while (true) {
      const existingUser = await User.findOne({ displayName: uniqueName });

      if (!existingUser) {
        break;
      }

      uniqueName = `${trimmedName} ${suffix}`;
      suffix++;
    }

    const newUser = await User.create({
      displayName: uniqueName,
    });

    return res.status(201).json({
      success: true,
      userId: newUser._id,
      displayName: newUser.displayName,
    });
  } catch (error) {
    console.error("Error in createUser controller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while creating user",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        userId: user._id,
        displayName: user.displayName,
        gamesPlayed: user.gamesPlayed,
        wins: user.wins,
        losses: user.losses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in getUserById controller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while retrieving user details",
    });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find()
      .sort({ wins: -1, gamesPlayed: 1 })
      .limit(10)
      .select("displayName wins losses gamesPlayed");

    return res.status(200).json({
      success: true,
      leaderboard: topUsers,
    });
  } catch (error) {
    console.error("Error in getLeaderboard controller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while retrieving leaderboard",
    });
  }
};
