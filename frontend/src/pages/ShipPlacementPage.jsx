import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getSessionById } from "../services/sessionService";
import { placeShips } from "../services/sessionService";
import { socket } from "../services/socketService";
import { toast } from "react-toastify";
import { ArrowLeft, RefreshCw, RotateCw, Trash2, Shield } from "lucide-react";

const SHIP_SIZES = {
  carrier: 5,
  battleship: 4,
  destroyer: 3,
  patrolBoat: 2,
};

const ShipPlacementPage = () => {
  const { sessionId } = useParams();
  const { user, loading: contextLoading } = useUser();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const [placedShips, setPlacedShips] = useState([]);
  const [board, setBoard] = useState([]);
  const [selectedShipType, setSelectedShipType] = useState("carrier");
  const [orientation, setOrientation] = useState("horizontal");
  const [hoveredCells, setHoveredCells] = useState([]);
  const [isValidHover, setIsValidHover] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadSessionDetails = async () => {
    try {
      const data = await getSessionById(sessionId);
      setSession(data.session);

      const size = data.session.gridSize;
      const initialBoard = Array(size)
        .fill(null)
        .map(() => Array(size).fill("empty"));
      setBoard(initialBoard);
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
    if (!session || !user) return;

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
    return <Navigate to="/lobby" replace />;
  }

  const isOpponentJoined = session.opponentId !== null;
  const gridSize = session.gridSize;

  const getPlacedCount = (type) => {
    return placedShips.filter((ship) => ship.shipId.startsWith(type)).length;
  };

  const getShipCoords = (row, col, size) => {
    const coords = [];
    for (let i = 0; i < size; i++) {
      if (orientation === "horizontal") {
        coords.push({ row, col: col + i });
      } else {
        coords.push({ row: row + i, col });
      }
    }
    return coords;
  };

  const checkValidity = (coords) => {
    for (const coord of coords) {
      if (
        coord.row < 0 ||
        coord.row >= gridSize ||
        coord.col < 0 ||
        coord.col >= gridSize
      ) {
        return false;
      }
      const isOverlapping = placedShips.some((ship) =>
        ship.positions.some((p) => p.row === coord.row && p.col === coord.col),
      );
      if (isOverlapping) return false;
    }
    return true;
  };

  const handleMouseEnter = (row, col) => {
    const size = SHIP_SIZES[selectedShipType];

    const maxAllowed = session.shipConfig[selectedShipType] || 0;
    if (getPlacedCount(selectedShipType) >= maxAllowed) {
      setHoveredCells([]);
      return;
    }

    const coords = getShipCoords(row, col, size);
    setHoveredCells(coords);
    setIsValidHover(checkValidity(coords));
  };

  const handleMouseLeave = () => {
    setHoveredCells([]);
  };

  const handleCellClick = (row, col) => {
    const size = SHIP_SIZES[selectedShipType];
    const maxAllowed = session.shipConfig[selectedShipType] || 0;

    if (getPlacedCount(selectedShipType) >= maxAllowed) {
      toast.warning(`You have already placed all ${selectedShipType}s!`);
      return;
    }

    const coords = getShipCoords(row, col, size);
    if (!checkValidity(coords)) {
      toast.error(
        "Invalid placement! Ships cannot overlap or go out of bounds.",
      );
      return;
    }

    const suffix = getPlacedCount(selectedShipType) + 1;
    const newShip = {
      shipId: `${selectedShipType}_${suffix}`,
      size,
      positions: coords,
    };

    setPlacedShips([...placedShips, newShip]);

    const updatedBoard = [...board];
    coords.forEach((coord) => {
      updatedBoard[coord.row][coord.col] = "ship";
    });
    setBoard(updatedBoard);
    setHoveredCells([]);

    toast.success(`${selectedShipType.toUpperCase()} placed successfully.`);
  };

  const handleReset = () => {
    setPlacedShips([]);
    const clearedBoard = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill("empty"));
    setBoard(clearedBoard);
    toast.info("Fleet layout has been cleared.");
  };

  const isFleetComplete = () => {
    return Object.keys(session.shipConfig).every(
      (type) => getPlacedCount(type) === session.shipConfig[type],
    );
  };

  const handleSubmitPlacement = async () => {
    if (!isFleetComplete()) {
      toast.error("Please place your entire fleet before locking in!");
      return;
    }

    setSubmitting(true);
    try {
      const response = await placeShips(sessionId, user.userId, placedShips);
      toast.success(response.message || "Fleet locked in successfully!");

      if (response.gameStarted) {
        navigate(`/game/${sessionId}`);
      } else {
        toast.info("Awaiting your opponent to complete ship placements...");
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-center items-center">
      <div className="max-w-5xl w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl relative shadow-2xl">
        <button
          onClick={() => navigate("/lobby")}
          disabled={submitting}
          className="absolute top-6 left-6 text-slate-500 hover:text-slate-300 transition duration-300 disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mt-4">
          <h1 className="text-2xl font-bold text-cyan-400 mb-1 flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-cyan-500" /> Fleet Ship Placement
          </h1>
          <p className="text-xs text-slate-500 mb-6 uppercase tracking-wider font-mono">
            Room Code: #{session.roomCode}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-950 border border-slate-900 p-4 rounded-xl text-center">
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
          <div className="grid lg:grid-cols-12 gap-8 items-start justify-center">
            <div className="lg:col-span-7 flex flex-col items-center">
              <div
                className="grid gap-1 bg-slate-950 border border-slate-850 p-3 rounded-2xl max-w-[380px] w-full aspect-square"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                }}
              >
                {board.map((rowArr, rIndex) =>
                  rowArr.map((cellState, cIndex) => {
                    const isHovered = hoveredCells.some(
                      (cell) => cell.row === rIndex && cell.col === cIndex,
                    );
                    const isOccupied = cellState === "ship";

                    let cellBg = "bg-slate-900/50 hover:bg-slate-850";
                    if (isOccupied)
                      cellBg = "bg-cyan-500/20 border-cyan-500 text-cyan-400";
                    if (isHovered) {
                      cellBg = isValidHover
                        ? "bg-emerald-500/30 border-emerald-500"
                        : "bg-red-500/30 border-red-500";
                    }

                    return (
                      <button
                        key={`${rIndex}-${cIndex}`}
                        type="button"
                        onMouseEnter={() => handleMouseEnter(rIndex, cIndex)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleCellClick(rIndex, cIndex)}
                        disabled={submitting}
                        className={`aspect-square rounded border border-slate-850/50 flex items-center justify-center transition duration-150 ${cellBg}`}
                      />
                    );
                  }),
                )}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-5 text-left w-full">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-200">Placement Controls</h3>
                <button
                  type="button"
                  onClick={() =>
                    setOrientation(
                      orientation === "horizontal" ? "vertical" : "horizontal",
                    )
                  }
                  className="bg-slate-950 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl text-cyan-400 font-bold flex items-center gap-2 transition"
                >
                  <RotateCw className="w-4 h-4" /> Rotate (
                  {orientation === "horizontal" ? "H" : "V"})
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                  Available Fleet
                </p>
                {Object.keys(session.shipConfig).map((type) => {
                  const maxCount = session.shipConfig[type];
                  const currentCount = getPlacedCount(type);
                  const isCompleted = currentCount === maxCount;
                  const isSelected = selectedShipType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedShipType(type)}
                      disabled={isCompleted || submitting}
                      className={`w-full p-4 rounded-xl border text-left flex justify-between items-center transition ${isSelected
                          ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                          : isCompleted
                            ? "bg-slate-900/30 border-slate-900 text-slate-600 cursor-not-allowed"
                            : "bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-700"
                        }`}
                    >
                      <span className="capitalize font-semibold">
                        {type} (Size: {SHIP_SIZES[type]})
                      </span>
                      <span className="text-xs font-mono font-bold bg-slate-900 px-3 py-1 rounded-full text-slate-400">
                        {currentCount} / {maxCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={placedShips.length === 0 || submitting}
                  className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 p-3.5 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleSubmitPlacement}
                  disabled={submitting || !isFleetComplete()}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Locking in..." : "Lock In Placement"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipPlacementPage;
