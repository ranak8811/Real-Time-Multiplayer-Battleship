import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Anchor, Crosshair, Trophy, AlertTriangle, ShieldCheck, Shield } from "lucide-react";

const RulesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 pb-6 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-cyan-500 animate-pulse" />
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-wider">
                Battleship Rules
              </h1>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                Captain's Reference Manual
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition duration-300 font-mono text-xs uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </header>

        {/* Introduction Banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-cyan-500/10 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
          <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2 mb-2">
            <Anchor className="w-5 h-5 text-cyan-500" />
            THE ULTIMATE NAVAL WARFARE
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Battleship Arena is a strategic board guessing game for two players. Each player has a secret ocean grid where they position their fleet. Players take turns firing shots to locate and destroy the opponent's armada. The commander who sinks all enemy vessels first wins!
          </p>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Game Modes */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              1. Choose Game Mode
            </h3>
            <ul className="space-y-3 text-xs text-slate-400 font-mono">
              <li className="flex gap-2">
                <span className="text-emerald-400">■</span>
                <span>
                  <strong className="text-slate-200">Classic Match:</strong> Played on a standard 10x10 grid. Requires placement of all 4 fleet ships.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">■</span>
                <span>
                  <strong className="text-slate-200">Quick Match:</strong> Played on a fast-paced 5x5 grid. Requires a minimum of 2 ships to lock in.
                </span>
              </li>
            </ul>
          </div>

          {/* Ship Placement */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Anchor className="w-5 h-5 text-cyan-400" />
              2. Positioning Fleet
            </h3>
            <ul className="space-y-3 text-xs text-slate-400 font-mono">
              <li className="flex gap-2">
                <span className="text-cyan-400">■</span>
                <span>Drag and drop or tap ships on the coordinate board.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">■</span>
                <span>Press the rotate button to orient ships horizontally or vertically.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">■</span>
                <span>Ensure ships do not overlap and fit entirely on the grid boundaries.</span>
              </li>
            </ul>
          </div>

          {/* Combat Actions */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-rose-500" />
              3. Combat & Firing
            </h3>
            <ul className="space-y-3 text-xs text-slate-400 font-mono">
              <li className="flex gap-2">
                <span className="text-rose-500">■</span>
                <span>Players take turns striking coordinates on the opponent's Radar grid.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-rose-500">■</span>
                <span>
                  Hits are marked with <strong className="text-rose-400">💥</strong>, and misses with <strong className="text-slate-400">💧</strong>.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-rose-500">■</span>
                <span>Real-time status cards show intact and sunk vessels. Sunk ships are highlighted in red.</span>
              </li>
            </ul>
          </div>

          {/* Disconnection & Forfeits */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              4. Leave & Retreat Rules
            </h3>
            <ul className="space-y-3 text-xs text-slate-400 font-mono">
              <li className="flex gap-2">
                <span className="text-amber-500">■</span>
                <span>
                  <strong className="text-slate-200">Retreat Button:</strong> Voluntarily retreating from the match forfeits it. You lose, and your opponent wins.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500">■</span>
                <span>
                  <strong className="text-slate-200">Disconnection:</strong> Closing the tab or disconnecting grants an automatic win to the remaining captain.
                </span>
              </li>
            </ul>
          </div>

          {/* Captain Credentials & Sessions */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md md:col-span-2">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              5. Captain Credentials & Authentication
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                  New vs. Returning Captains
                </h4>
                <ul className="space-y-3 text-xs text-slate-400 font-mono">
                  <li className="flex gap-2">
                    <span className="text-cyan-400">■</span>
                    <span>
                      <strong className="text-slate-200">Register (New Captain):</strong> Choose a unique name. If the name is already in use, a numeric suffix (e.g., John 2) is automatically appended to keep accounts distinct.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400">■</span>
                    <span>
                      <strong className="text-slate-200">Login (Returning Captain):</strong> Return using your exact original name to retrieve your stats, game history, and rank instantly.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                  Why it is built this way
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Since Captain profiles contain valuable stats like total battles, wins, losses, and leaderboard standing, this dual system prevents new players from accidentally overwriting or accessing a veteran captain's historical data, while providing seamless profile recovery for returning players.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Leaderboard Info */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-500/20 shadow-md flex items-center gap-4">
          <Trophy className="w-12 h-12 text-amber-400 shrink-0 animate-bounce" />
          <div>
            <h4 className="text-sm font-extrabold text-amber-300 uppercase tracking-wider">
              Earn Your Rank on the Leaderboard
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Every victory in the arena updates your captain profile win count. Climb the rankings and show the world your strategic superiority!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;
