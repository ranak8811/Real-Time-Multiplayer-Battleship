const CreateGamePage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-cyan-400">
          Configure Game Session
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Grid Size
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[8, 10, 12, 15].map((size) => (
                <button
                  key={size}
                  className={`py-3 rounded-xl font-bold border transition duration-300 ${size === 10 ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"}`}
                >
                  {size} x {size}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 px-6 rounded-xl transition duration-300">
              Host Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGamePage;
