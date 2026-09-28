import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PublicStore from "./pages/PublicStore";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-center">Carregando...</div>;
  return user ? children : <Navigate to="/painel" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<PublicStore />} />
        <Route path="/painel" element={<Login />} />
        <Route path="/painel/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}