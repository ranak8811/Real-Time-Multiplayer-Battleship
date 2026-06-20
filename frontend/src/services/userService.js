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
