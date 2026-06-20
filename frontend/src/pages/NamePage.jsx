const NamePage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 tracking-wider">
          BATTLESHIP
        </h1>
        <p className="text-slate-400 mb-8 text-sm uppercase tracking-widest">
          Multiplayer Real-Time
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter your display name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition duration-300"
          />
          <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-cyan-950/50 hover:shadow-cyan-900/50 transform active:scale-95 transition duration-300">
            Enter Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default NamePage;
