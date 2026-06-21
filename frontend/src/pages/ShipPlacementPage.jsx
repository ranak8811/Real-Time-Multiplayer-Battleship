import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getSessionById } from "../services/sessionService";
import { socket } from "../services/socketService";
import { toast } from "react-toastify";
import { ArrowLeft, RefreshCw } from "lucide-react";

const ShipPlacementPage = () => {
  const { sessionId } = useParams();
  const { user, loading: contextLoading } = useUser();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadSessionDetails = async () => {
    try {
      const data = await getSessionById(sessionId);
      setSession(data.session);
    } catch (error) {
      toast.error(error);
      navigate("/lobby");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadSessionDetails();
    }
  }, [user, sessionId]);

  useEffect(() => {
    if (!session?.roomCode || !user?.userId) return;

    socket.emit("join-room", {
      roomCode: session.roomCode,
      userId: user.userId,
    });
    console.log("[Socket] Emitted join-room for room code:", session.roomCode);
  }, [session?.roomCode, user?.userId]);

  useEffect(() => {
    if (!user) return;

    socket.on("player-joined-room", (data) => {
      console.log("[Socket Event] Opponent entered room:", data);
      toast.success(
        "Your opponent has joined the battle room! Prepare your fleet.",
      );
      loadSessionDetails();
    });

    return () => {
      socket.off("player-joined-room");
    };
  }, [user]);

  if (contextLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <p className="text-slate-400 mb-4">
            Game session details could not be found.
          </p>
          <button
            onClick={() => navigate("/lobby")}
            className="bg-slate-950 px-6 py-2.5 rounded-xl border border-slate-800 text-cyan-400"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  const isOpponentJoined = session.opponentId !== null;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-center items-center">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl relative">
        <button
          onClick={() => navigate("/lobby")}
          className="absolute top-6 left-6 text-slate-500 hover:text-slate-300 transition duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mt-4">
          <h1 className="text-2xl font-bold text-cyan-400 mb-1">
            Fleet Ship Placement
          </h1>
          <p className="text-xs text-slate-500 mb-6 uppercase tracking-wider font-mono">
            Room Code: #{session.roomCode}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-950 border border-slate-850 p-4 rounded-xl text-center">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
              Fleet Host
            </p>
            <p className="font-bold text-cyan-400 text-base">
              {session.ownerId?.displayName || "Unknown"}
            </p>
          </div>
          <div className="border-l border-slate-900">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
              Opponent
            </p>
            <p
              className={`font-bold text-base ${isOpponentJoined ? "text-emerald-400" : "text-slate-650 italic animate-pulse"}`}
            >
              {isOpponentJoined
                ? session.opponentId.displayName
                : "Awaiting Captain..."}
            </p>
          </div>
        </div>

        {!isOpponentJoined ? (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
            <RefreshCw className="w-10 h-10 text-cyan-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-300 mb-2">
              Waiting for Player 2 to Join
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto px-4">
              Share the Room Code{" "}
              <span className="text-cyan-400 font-mono font-bold tracking-widest">
                #{session.roomCode}
              </span>{" "}
              with a friend to begin fleet positioning.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 items-center justify-center animate-fade-in">
            <div className="aspect-square max-w-[320px] mx-auto w-full bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-sm font-semibold">
              [ Grid Map Size: {session.gridSize} x {session.gridSize} ]
            </div>

            <div className="text-left space-y-4">
              <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-2">
                Fleet Placement Phase
              </h3>
              <p className="text-xs text-slate-500">
                All coordinates must be placed horizontally or vertically. No
                overlaps allowed.
              </p>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-sm text-slate-400">
                <p className="font-semibold text-slate-300 mb-2">
                  Configured Fleet:
                </p>
                <div className="flex justify-between text-xs py-1">
                  <span>Carrier (Size 5)</span>
                  <span className="text-cyan-500">1x</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span>Battleship (Size 4)</span>
                  <span className="text-cyan-500">2x</span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg">
                Ready to Battle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipPlacementPage;
