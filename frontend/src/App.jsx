import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 antialiased selection:bg-cyan-500 selection:text-slate-950">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
};

export default App;
