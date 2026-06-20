import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./context/UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 antialiased selection:bg-cyan-500 selection:text-slate-950">
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </div>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
