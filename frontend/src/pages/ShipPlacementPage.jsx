import { useParams } from "react-router-dom";

const ShipPlacementPage = () => {
  const { sessionId } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
        <h1 className="text-2xl font-bold text-cyan-400 mb-2">
          Place Your Ships
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Room Session ID: {sessionId}
        </p>

        <div className="grid md:grid-cols-2 gap-8 items-center justify-center">
          <div className="aspect-square max-w-[350px] mx-auto w-full bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-slate-700">
            [10x10 Placement Grid Map]
          </div>
          <div className="text-left space-y-4">
            <h3 className="font-semibold text-slate-300">Available Ships</h3>
            <div className="space-y-2">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between">
                <span>Carrier (Size 5)</span>
                <span className="text-cyan-500">x1</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between">
                <span>Battleship (Size 4)</span>
                <span className="text-cyan-500">x2</span>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-xl">
              Lock In Placement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipPlacementPage;
