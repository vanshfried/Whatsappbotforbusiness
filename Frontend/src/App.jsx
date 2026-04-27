import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./Login/Login";
import Dashboard from "./pages/Dashboard";
import CreateUser from "./pages/CreateUser";
import { logoutUser, refreshToken } from "../API/LoginAPI";
import BulkMessage from "./pages/BulkMessage";
import CampaignHistory from "./pages/CampaignHistory";
import CampaignDetail from "./pages/CampaignDetail";

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
            <Route path="/bulk-message" element={<BulkMessage />} />

            <Route
              path="/create-user"
              element={
                role === "admin" || role === "superadmin" ? (
                  <CreateUser currentRole={role} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route path="/campaign-history" element={<CampaignHistory />} />
            <Route path="/campaign-detail" element={<CampaignDetail />} />

            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
