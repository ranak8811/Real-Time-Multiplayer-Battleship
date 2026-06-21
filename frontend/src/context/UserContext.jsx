import { createContext, useContext, useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "../services/socketService";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("battleship_user");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        connectSocket(parsedUser.userId);
      } catch (error) {
        console.error("Error parsing saved user from localStorage:", error);
        localStorage.removeItem("battleship_user");
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem("battleship_user", JSON.stringify(userData));

    connectSocket(userData.userId);
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("battleship_user");

    disconnectSocket();
  };

  return (
    <UserContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};
