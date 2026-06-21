import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getSessionById, fireShot } from "../services/sessionService";
import { socket } from "../services/socketService";
import { toast } from "react-toastify";
import {
  Shield,
  Crosshair,
  Swords,
  LogOut,
  Loader2,
  Trophy,
} from "lucide-react";

const GamePage = () => {
  const { sessionId } = useParams();
  const { user, loading: contextLoading } = useUser();
  const [session, setSession] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerRole, setPlayerRole] = useState(null);
  const navigate = useNavigate();


  const loadGameDetails = async () => {
    try {
      const data = await getSessionById(sessionId);
      if (!data || !data.session) {
        toast.error("Failed to load session details");
        navigate("/lobby");
        return;
      }
      setSession(data.session);
      setGameState(data.gameState);

      if (data.session.ownerId._id === user.userId) {
        setPlayerRole("player1");
      } else if (data.session.opponentId?._id === user.userId) {
        setPlayerRole("player2");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading battlefield");
      navigate("/lobby");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && sessionId) {
      loadGameDetails();
    }
  }, [user, sessionId]);


  useEffect(() => {
    if (!session || !user) return;

    socket.emit("join-room", {
      roomCode: session.roomCode,
      userId: user.userId,
    });

    console.log("[Socket] Joined battlefield room:", session.roomCode);


    socket.on("shot-fired", (data) => {
      console.log("[Socket Event] Shot Fired Received:", data);


      setGameState(data.gameState);

      const colLetter = String.fromCharCode(65 + data.col);
      const rowNumber = data.row + 1;
      const isAttacker = data.attackerId === user.userId;


      if (data.result === "hit") {
        if (isAttacker) {
          toast.success(
            `DIRECT HIT! Targeted coordinates ${colLetter}${rowNumber} successfully! 💥`,
          );
          if (data.sunkShip) {
            toast.info(
              `SHIP SUNK! You annihilated opponent's ${data.sunkShip.split("_")[0].toUpperCase()}! 🚢`,
            );
          }
        } else {
          toast.error(
            `FLEET UNDER ATTACK! Opponent struck your grid at ${colLetter}${rowNumber}! 💥`,
          );
          if (data.sunkShip) {
            toast.error(
              `WARSHIP LOST! Your ${data.sunkShip.split("_")[0].toUpperCase()} has been sunk! 🚨`,
            );
          }
        }
      } else {
        if (isAttacker) {
          toast.info(
            `Missed! Shot splashed into water at ${colLetter}${rowNumber}. 💧`,
          );
        } else {
          toast.success(
            `Splash! Opponent missed target at ${colLetter}${rowNumber}. 💧`,
          );
        }
      }


      if (data.winnerId) {
        if (data.winnerId === user.userId) {
          toast.success("VICTORY! You have destroyed the entire enemy fleet!", {
            autoClose: false,
          });
        } else {
          toast.error("DEFEAT! All your warships have been sunk!", {
            autoClose: false,
          });
        }
      }
    });

    return () => {
      socket.off("shot-fired");
    };
  }, [session?.roomCode, user?.userId]);

  if (contextLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-955 text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!session || !gameState) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400">
          Battlefield status not loaded properly.
        </p>
        <button
          onClick={() => navigate("/lobby")}
          className="px-6 py-2 bg-slate-800 rounded-xl"
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  const myRole = playerRole;
  const opponentRole = myRole === "player1" ? "player2" : "player1";

  const myBoard = gameState[`${myRole}Board`] || [];
  const opponentBoard = gameState[`${opponentRole}Board`] || [];

  const myName =
    myRole === "player1"
      ? session.ownerId.displayName
      : session.opponentId?.displayName || "Opponent";
  const opponentName =
    myRole === "player1"
      ? session.opponentId?.displayName || "Opponent"
      : session.ownerId.displayName;

  const isMyTurn = gameState.currentTurn === user.userId;
  const isFinished = gameState.gameStatus === "finished";


  const handleCellAttack = async (row, col) => {
    if (isFinished) return;
    if (!isMyTurn) {
      toast.warning("It's not your turn to fire!");
      return;
    }
    const cellValue = opponentBoard[row][col];
    if (cellValue === "hit" || cellValue === "miss") {
      toast.warning("Target coordinate has already been struck!");
      return;
    }

    try {
      await fireShot(sessionId, user.userId, row, col);
    } catch (error) {
      toast.error(error);
    }
  };

  const getCellColor = (cell, isRadar) => {
    switch (cell) {
      case "ship":
        return isRadar
          ? "bg-slate-950 hover:bg-slate-900 border-slate-900"
          : "bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.15)]";
      case "hit":
        return "bg-rose-600/30 border-rose-500 text-rose-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.25)]";
      case "miss":
        return "bg-slate-800/40 border-slate-700/60 text-slate-500";
      default:
        return "bg-slate-950 hover:bg-slate-900/60 border-slate-800/40";
    }
  };

  const getCellContent = (cell, isRadar) => {
    if (cell === "hit") return "💥";
    if (cell === "miss") return "💧";
    if (cell === "ship" && !isRadar) return "⚓";
    return "";
  };

  return (
    <div className="min-h-screen bg-slate-955 bg-slate-950 text-white p-4 md:p-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-6xl mx-auto">

        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-900 pb-6">
          <div className="flex items-center gap-3">
            <Swords className="w-8 h-8 text-cyan-500 animate-pulse" />
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-wider">
                Battleship Arena
              </h1>
              <p className="text-xs text-slate-500 font-mono">
                ROOM CODE: #{session.roomCode}
              </p>
            </div>
          </div>


          <div className="flex items-center gap-4">
            {isFinished ? (
              <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <Trophy className="w-5 h-5 text-amber-550" />
                <span>MATCH FINISHED</span>
              </div>
            ) : isMyTurn ? (
              <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.1)] animate-pulse">
                <Crosshair className="w-4 h-4 animate-spin-slow" />
                <span>YOUR TURN TO ATTACK</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
                <Shield className="w-4 h-4" />
                <span>OPPONENT DEFENDING...</span>
              </div>
            )}

            <button
              onClick={() => navigate("/lobby")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-955/20 hover:border-rose-900/40 text-slate-400 hover:text-rose-450 hover:text-rose-400 transition duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Retreat</span>
            </button>
          </div>
        </header>


        {isFinished && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-500/30 text-center shadow-[0_0_30px_rgba(245,158,11,0.05)]">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-bounce" />
            <h2 className="text-xl font-bold text-amber-300">
              {gameState.winner === user.userId
                ? "YOU ARE VICTORIOUS!"
                : "YOU HAVE BEEN DEFEATED!"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-widest">
              Winner: {gameState.winner === user.userId ? myName : opponentName}
            </p>
          </div>
        )}


        <div className="grid grid-cols-2 gap-4 mb-8">
          <div
            className={`p-4 rounded-2xl border transition duration-300 ${!isFinished && isMyTurn ? "bg-cyan-500/5 border-cyan-500/25" : "bg-slate-900/50 border-slate-800/60"}`}
          >
            <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">
              Player 1 (You)
            </span>
            <h3 className="text-lg font-bold text-slate-200 mt-1">{myName}</h3>
          </div>
          <div
            className={`p-4 rounded-2xl border transition duration-300 ${!isFinished && !isMyTurn ? "bg-amber-500/5 border-amber-500/25" : "bg-slate-900/50 border-slate-800/60"}`}
          >
            <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">
              Player 2 (Opponent)
            </span>
            <h3 className="text-lg font-bold text-slate-200 mt-1">
              {opponentName}
            </h3>
          </div>
        </div>


        <div className="grid lg:grid-cols-2 gap-10">

          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -z-10"></div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h2 className="font-extrabold text-lg text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-cyan-500" /> Radar Board
                (Attacks)
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                Target Enemy Fleet
              </span>
            </div>

            <div className="flex justify-center items-center">
              <div className="relative overflow-x-auto">
                <div className="flex pl-6 mb-1">
                  {Array.from({ length: session.gridSize }).map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-6 flex items-center justify-center text-[10px] font-mono text-slate-500 font-bold"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>

                <div className="flex">
                  <div className="flex flex-col pr-2">
                    {Array.from({ length: session.gridSize }).map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-8 flex items-center justify-end text-[10px] font-mono text-slate-500 font-bold"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  <div
                    className="grid border border-slate-800 bg-slate-950 p-1 rounded-xl shadow-inner gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${session.gridSize}, minmax(0, 1fr))`,
                    }}
                  >
                    {opponentBoard.map((row, rIdx) =>
                      row.map((cell, cIdx) => (
                        <button
                          key={`${rIdx}-${cIdx}`}
                          onClick={() => handleCellAttack(rIdx, cIdx)}
                          disabled={
                            isFinished ||
                            !isMyTurn ||
                            cell === "hit" ||
                            cell === "miss"
                          }
                          className={`w-8 h-8 border flex items-center justify-center text-xs font-mono rounded-md transition-all duration-200 cursor-crosshair ${getCellColor(cell, true)} ${!isFinished &&
                              isMyTurn &&
                              cell !== "hit" &&
                              cell !== "miss"
                              ? "hover:border-cyan-400 hover:shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                              : "disabled:opacity-80"
                            }`}
                        >
                          {getCellContent(cell, true)}
                        </button>
                      )),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -z-10"></div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h2 className="font-extrabold text-lg text-amber-500 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" /> Fleet Board
                (Defense)
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                Your Ships & Shields
              </span>
            </div>

            <div className="flex justify-center items-center">
              <div className="relative overflow-x-auto">
                <div className="flex pl-6 mb-1">
                  {Array.from({ length: session.gridSize }).map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-6 flex items-center justify-center text-[10px] font-mono text-slate-500 font-bold"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>

                <div className="flex">
                  <div className="flex flex-col pr-2">
                    {Array.from({ length: session.gridSize }).map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-8 flex items-center justify-end text-[10px] font-mono text-slate-500 font-bold"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  <div
                    className="grid border border-slate-800 bg-slate-950 p-1 rounded-xl shadow-inner gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${session.gridSize}, minmax(0, 1fr))`,
                    }}
                  >
                    {myBoard.map((row, rIdx) =>
                      row.map((cell, cIdx) => (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`w-8 h-8 border flex items-center justify-center text-xs font-mono rounded-md ${getCellColor(cell, false)}`}
                        >
                          {getCellContent(cell, false)}
                        </div>
                      )),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <footer className="mt-10 bg-slate-900/20 border border-slate-800/60 p-4 rounded-2xl flex flex-wrap justify-center gap-6 text-sm text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border border-slate-800 bg-slate-950 rounded-sm"></span>
            <span>Water / Hidden</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border border-cyan-500/50 bg-cyan-500/20 text-cyan-400 rounded-sm flex items-center justify-center text-[10px]">
              ⚓
            </span>
            <span>Your Ship</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border border-rose-500 bg-rose-600/30 text-rose-400 rounded-sm flex items-center justify-center text-[10px]">
              💥
            </span>
            <span>Successful Hit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border border-slate-700 bg-slate-800/40 text-slate-500 rounded-sm flex items-center justify-center text-[10px]">
              💧
            </span>
            <span>Missed Shot</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default GamePage;
