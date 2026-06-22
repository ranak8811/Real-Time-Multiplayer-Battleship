import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getSessions, joinSession } from "../services/sessionService";
import { getUserDetails } from "../services/userService";
import { toast } from "react-toastify";
import {
  RefreshCw,
  Play,
  LogOut,
  Trophy,
  Award,
  ShieldAlert,
  Activity,
} from "lucide-react";

const LobbyPage = () => {
  const { user, loading: contextLoading, logoutUser } = useUser();
  const [sessions, setSessions] = useState([]);
  const [profileStats, setProfileStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await getSessions();
      setSessions(data.sessions || []);
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileStats = async () => {
    try {
      const data = await getUserDetails(user.userId);
      if (data.success) {
        setProfileStats(data.user);
      }
    } catch (error) {
      console.error("Error fetching profile details:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRooms();
      fetchProfileStats();
    }
  }, [user]);

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

  const handleJoin = async (roomCode) => {
    try {
      const data = await joinSession(roomCode, user.userId);
      toast.success(data.message || "Joined room successfully!");
      navigate(`/place-ships/${data.session.sessionId}`);
    } catch (error) {
      toast.error(error);
      fetchRooms();
    }
  };

  const handleLogout = () => {
    logoutUser();
    toast.info("Logged out from session");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8 pb-6 border-b border-slate-900">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Battleship Lobby
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Welcome back,{" "}
              <span className="text-cyan-400 font-semibold">
                {user.displayName}
              </span>
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                fetchRooms();
                fetchProfileStats();
              }}
              disabled={loading}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 p-2.5 rounded-xl transition duration-300 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            <button
              onClick={() => navigate("/create")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 px-5 rounded-xl transition duration-300 shadow-md shadow-cyan-950/20"
            >
              Create Game
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 p-2.5 rounded-xl transition duration-300"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {profileStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -z-10"></div>

            <div className="bg-slate-950/50 border border-slate-900/60 p-4 rounded-xl flex items-center gap-3">
              <Activity className="w-8 h-8 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  Battles
                </span>
                <span className="text-xl font-bold text-slate-200 mt-0.5 font-mono">
                  {profileStats.gamesPlayed}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-900/60 p-4 rounded-xl flex items-center gap-3">
              <Trophy className="w-8 h-8 text-emerald-500" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  Wins
                </span>
                <span className="text-xl font-bold text-emerald-400 mt-0.5 font-mono">
                  {profileStats.wins}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-900/60 p-4 rounded-xl flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-500" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  Losses
                </span>
                <span className="text-xl font-bold text-rose-400 mt-0.5 font-mono">
                  {profileStats.losses}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-900/60 p-4 rounded-xl flex items-center gap-3">
              <Award className="w-8 h-8 text-cyan-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  Win Rate
                </span>
                <span className="text-xl font-bold text-cyan-400 mt-0.5 font-mono">
                  {profileStats.gamesPlayed > 0
                    ? `${Math.round((profileStats.wins / profileStats.gamesPlayed) * 100)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>
        )}

        <main>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-200">
                Available Battle Rooms
              </h2>
              <span className="bg-cyan-500/10 text-cyan-400 text-xs px-3 py-1 rounded-full font-semibold border border-cyan-500/20">
                {sessions.length} Room(s) Waiting
              </span>
            </div>

            {loading && sessions.length === 0 ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                <p className="text-slate-500 text-sm">
                  Searching for active battle rooms...
                </p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                <p className="text-slate-500 text-lg mb-2">
                  No active rooms found
                </p>
                <p className="text-slate-600 text-sm mb-6">
                  Be the first to host a game and invite players!
                </p>
                <button
                  onClick={() => navigate("/create")}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-cyan-400 font-semibold py-2 px-6 rounded-xl transition duration-300"
                >
                  Create Room
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((room) => (
                  <div
                    key={room._id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-6 rounded-xl flex flex-col justify-between transition duration-300 group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20">
                          {room.status}
                        </span>
                        <span className="text-slate-600 font-mono text-sm uppercase">
                          #{room.roomCode}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-200 text-lg mb-1 group-hover:text-cyan-400 transition">
                        {room.ownerId?.displayName || "Unknown Captain"}
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">Fleet Host</p>

                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-400 py-3 border-t border-slate-900 mb-6">
                        <div>Grid Size:</div>
                        <div className="text-right font-semibold text-slate-200">
                          {room.gridSize} x {room.gridSize}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoin(room.roomCode)}
                      className="w-full bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-slate-800 hover:border-cyan-500 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition duration-300 group/btn"
                    >
                      <Play className="w-4 h-4 fill-current group-hover/btn:scale-110 transition" />
                      Join Battle
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LobbyPage;
