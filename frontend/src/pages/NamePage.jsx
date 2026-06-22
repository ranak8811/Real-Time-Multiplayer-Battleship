import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser, loginUserByName } from "../services/userService";
import { Swords, UserPlus, LogIn, HelpCircle } from "lucide-react";

const NamePage = () => {
  const [name, setName] = useState("");
  const [activeTab, setActiveTab] = useState("register");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a display name");
      return;
    }

    try {
      setLoading(true);
      let response;

      if (activeTab === "register") {
        response = await registerUser(name);
        toast.success(`Welcome aboard, Captain ${response.displayName}!`);
      } else {
        response = await loginUserByName(name);
        toast.success(`Welcome back, Captain ${response.displayName}!`);
      }

      loginUser({
        userId: response.userId,
        displayName: response.displayName,
      });

      navigate("/lobby");
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 selection:bg-cyan-500/30">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="text-center mb-6">
          <Swords className="w-12 h-12 text-cyan-500 mx-auto mb-2 animate-pulse" />
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-wider">
            BATTLESHIP
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-widest mt-1 font-mono">
            Multiplayer Real-Time Arena
          </p>
        </div>

        <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl mb-6 font-mono text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setName("");
            }}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition duration-300 ${
              activeTab === "register"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>NEW CAPTAIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setName("");
            }}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition duration-300 ${
              activeTab === "login"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>RETURNING CAPTAIN</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block mb-2">
              {activeTab === "register"
                ? "Desired Fleet Name"
                : "Registered Captain Name"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                activeTab === "register"
                  ? "Choose name (e.g. John)..."
                  : "Enter exact name (e.g. John)..."
              }
              disabled={loading}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition duration-300 disabled:opacity-50 font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-cyan-950/40 hover:shadow-cyan-900/40 transform active:scale-95 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
          >
            {loading
              ? activeTab === "register"
                ? "Registering..."
                : "Verifying..."
              : activeTab === "register"
                ? "Commission Fleet"
                : "Access Station"}
          </button>
        </form>
        
        <div className="mt-6 text-center border-t border-slate-800/40 pt-4">
          <button
            type="button"
            onClick={() => navigate("/rules")}
            className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-400 font-mono transition duration-300"
          >
            <HelpCircle className="w-4 h-4" />
            <span>HOW TO PLAY & GAME RULES</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NamePage;
