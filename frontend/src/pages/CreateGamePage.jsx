import { useState } from "react";
import { useUser } from "../context/UserContext";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createSession } from "../services/sessionService";
import { ArrowLeft } from "lucide-react";

const CreateGamePage = () => {
  const { user, loading: contextLoading } = useUser();
  const [gridSize, setGridSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (contextLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleHostGame = async () => {
    setLoading(true);

    try {
      const response = await createSession(user.userId, gridSize);

      toast.success(`Room created successfully! Code: ${response.roomCode}`);
      navigate(`/place-ships/${response.sessionId}`);
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative">
        <button
          onClick={() => navigate("/lobby")}
          disabled={loading}
          className="absolute top-6 left-6 text-slate-500 hover:text-slate-300 transition duration-300 disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-bold mb-6 text-center text-cyan-400 mt-4">
          Configure Game Session
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3 text-slate-400">
              Select Grid Size
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[8, 10, 12, 15].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setGridSize(size)}
                  disabled={loading}
                  className={`py-3.5 rounded-xl font-bold border transition duration-300 transform active:scale-95 ${
                    gridSize === size
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-md shadow-cyan-950/20"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  {size} x {size}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl text-sm text-slate-400 space-y-2">
            <h3 className="font-semibold text-slate-300 mb-1">
              Standard Fleet Rules:
            </h3>
            <div className="flex justify-between">
              <span>Carrier (Size 5)</span>
              <span>1x</span>
            </div>
            <div className="flex justify-between">
              <span>Battleship (Size 4)</span>
              <span>2x</span>
            </div>
            <div className="flex justify-between">
              <span>Destroyer (Size 3)</span>
              <span>3x</span>
            </div>
            <div className="flex justify-between">
              <span>Patrol Boat (Size 2)</span>
              <span>4x</span>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleHostGame}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-cyan-950/20 transform active:scale-95 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Session..." : "Host Match"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGamePage;
