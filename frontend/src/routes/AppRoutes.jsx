import { Routes, Route, Navigate } from "react-router-dom";
import NamePage from "../pages/NamePage";
import LobbyPage from "../pages/LobbyPage";
import CreateGamePage from "../pages/CreateGamePage";
import ShipPlacementPage from "../pages/ShipPlacementPage";
import GamePage from "../pages/GamePage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<NamePage />} />
      {/* ২. গেম লবি পেজ */}
      <Route path="/lobby" element={<LobbyPage />} />

      {/* ৩. নতুন গেম সেশন তৈরি করার পেজ */}
      <Route path="/create" element={<CreateGamePage />} />

      {/* ৪. ডাইনামিক সেশন আইডি সহ শিপ প্লেসমেন্ট পেজ */}
      <Route path="/place-ships/:sessionId" element={<ShipPlacementPage />} />

      {/* ৫. ডাইনামিক সেশন আইডি সহ গেম খেলার মূল পেজ */}
      <Route path="/game/:sessionId" element={<GamePage />} />

      {/* ৬. ম্যাচ না করা যেকোনো ইউআরএল-এর জন্য হোম পেজে রিডাইরেক্ট করা */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
