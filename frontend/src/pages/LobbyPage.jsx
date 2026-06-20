const LobbyPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 pb-6 border-b border-slate-900">
          <div>
            <h1 className="text-2xl font-bold">Game Lobby</h1>
            <p className="text-sm text-slate-500">Welcome, Player</p>
          </div>
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 px-5 rounded-xl transition duration-300">
            Create Game
          </button>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-cyan-400">
            Active Game Sessions
          </h2>
          <div className="text-center py-12 text-slate-500">
            No active sessions. Create a new session to invite players.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
