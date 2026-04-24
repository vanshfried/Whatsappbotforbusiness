import { useState } from "react";
import Login from "./Login/Login";
import Dashboard from "./pages/Dashboard";
import { logoutUser } from "../API/LoginAPI";

export default function App() {
  const [role, setRole] = useState(null);

  const handleLogout = async () => {
    await logoutUser();
    setRole(null);
  };

  if (!role) {
    return <Login onLogin={setRole} />;
  }

  return <Dashboard role={role} onLogout={handleLogout} />;
}