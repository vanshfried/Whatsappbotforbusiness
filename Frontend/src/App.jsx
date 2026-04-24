import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./Login/Login";
import Dashboard from "./pages/Dashboard";
import CreateUser from "./pages/CreateUser";
import { logoutUser, refreshToken } from "../API/LoginAPI";

export default function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // 🔥 important

  // 🔥 restore session on refresh
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await refreshToken(); // calls backend
        setRole(res.role); // backend must return role
      } catch {
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setRole(null);
  };

  // 🔥 prevent flicker before auth check
  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {!role ? (
          <Route path="*" element={<Login onLogin={setRole} />} />
        ) : (
          <>
            <Route
              path="/"
              element={<Dashboard role={role} onLogout={handleLogout} />}
            />

            {(role === "admin" || role === "superadmin") && (
              <Route path="/create-user" element={<CreateUser />} />
            )}

            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}