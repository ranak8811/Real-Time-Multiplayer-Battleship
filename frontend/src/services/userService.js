import axiosClient from "../api/axiosClient";

export const registerUser = async (name) => {
  try {
    const response = await axiosClient.post("/users", { name });

    return response.data;
  } catch (error) {
    console.error("Error in registerUser service:", error);
    throw error.response?.data?.message || "Failed to register display name";
  }
};

export const getUserDetails = async (userId) => {
  try {
    const response = await axiosClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error in getUserDetails service:", error);
    throw (
      error.response?.data?.message || "Failed to retrieve player statistics"
    );
  }
};

export const getLeaderboard = async () => {
  try {
    const response = await axiosClient.get("/users/leaderboard");
    return response.data;
  } catch (error) {
    console.error("Error in getLeaderboard service:", error);
    throw (
      error.response?.data?.message || "Failed to retrieve leaderboard rankings"
    );
  }
};

export const loginUserByName = async (name) => {
  try {
    const response = await axiosClient.post("/users/login", { name });
    return response.data;
  } catch (error) {
    console.error("Error in loginUserByName service:", error);
    throw error.response?.data?.message || "Failed to login as captain";
  }
};
