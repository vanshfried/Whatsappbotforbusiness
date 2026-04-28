import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./Login/Login";
import Dashboard from "./pages/Dashboard";
import CreateUser from "./pages/CreateUser";
import { logoutUser, refreshToken } from "../API/LoginAPI";
import BulkMessage from "./pages/BulkMessage";
import CampaignHistory from "./pages/CampaignHistory";
import CampaignDetail from "./pages/CampaignDetail";
import Layout from "./pages/Layout"; // 🔥 IMPORT THIS

export default function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await refreshToken();
        setRole(res.role);
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

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {!role ? (
          <Route path="*" element={<Login onLogin={setRole} />} />
        ) : (
          <Route element={<Layout role={role} onLogout={handleLogout} />}>
            {/* ALL PAGES INSIDE LAYOUT */}
            <Route path="/" element={<Dashboard role={role} />} />
            <Route path="/bulk-message" element={<BulkMessage />} />
            <Route path="/campaign-history" element={<CampaignHistory />} />

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

            <Route path="/campaign-detail" element={<CampaignDetail />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}