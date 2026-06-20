import { useParams } from "react-router-dom";

const GamePage = () => {
  const { sessionId } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-900">
          <div>
            <h1 className="text-xl font-bold text-cyan-400">Match Action</h1>
            <p className="text-xs text-slate-500">Session: {sessionId}</p>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-xl text-cyan-400 font-bold">
            Your Turn
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
            <h2 className="font-semibold mb-4 text-slate-300">
              Your Radar Board (Attacks)
            </h2>
            <div className="aspect-square w-full bg-slate-950 rounded-xl flex items-center justify-center text-slate-700">
              [Attack Board]
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
            <h2 className="font-semibold mb-4 text-slate-300">
              Your Fleet Board (Defense)
            </h2>
            <div className="aspect-square w-full bg-slate-950 rounded-xl flex items-center justify-center text-slate-700">
              [Defense Board]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
