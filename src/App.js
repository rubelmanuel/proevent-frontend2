import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const [page, setPage] = useState("welcome");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    // Detectar token en la URL (ej: /reset-password/TOKEN)
    const path = window.location.pathname;
    if (path.startsWith("/reset-password/")) {
      const token = path.split("/")[2];
      setResetToken(token);
      setPage("reset-password");
    }
  }, []);

  return (
    <div>
      {page === "reset-password" ? (
        <ResetPassword 
          token={resetToken} 
          onBackClick={() => {
            window.history.pushState({}, "", "/");
            setPage("login");
          }} 
        />
      ) : page === "login" ? (
        <Login
          onLogin={(usuarioData) => {
            setIsLoggedIn(true);
            setUsuario(usuarioData);
            setPage("dashboard");
          }}
          onBackClick={() => setPage("welcome")}
          onForgotPasswordClick={() => setPage("forgot-password")}
        />
      ) : page === "forgot-password" ? (
        <ForgotPassword 
          onBackClick={() => setPage("login")} 
        />
      ) : page === "welcome" ? (
        <Welcome
          isLoggedIn={isLoggedIn}
          onLoginClick={() => setPage("login")}
          onLogoutClick={() => {
            setIsLoggedIn(false);
            setUsuario(null);
          }}
        />
      ) : (
        <Dashboard
          usuario={usuario}
          onLogoutClick={() => {
            setIsLoggedIn(false);
            setUsuario(null);
            setPage("welcome");
          }}
        />
      )}
    </div>
  );
}

export default App;