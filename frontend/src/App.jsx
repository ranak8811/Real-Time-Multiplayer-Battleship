import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./context/UserContext";

const App = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 antialiased selection:bg-cyan-500 selection:text-slate-950">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
