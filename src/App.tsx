import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Builder from "./pages/Builder";
import History from "./pages/History";

// Layouts & Protection
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* --- Public Landing, Login and Register paths --- */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* --- Protected Application paths (Wrapped in AppLayout & ProtectedRoute) --- */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="builder" element={<Builder />} />
              <Route path="history" element={<History />} />
            </Route>

            {/* --- Fallback wildcard redirect --- */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        
        {/* Floating notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#1E293B",
              color: "#F8FAFC",
              fontSize: "12px",
              fontWeight: "500",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            },
            success: {
              iconTheme: {
                primary: "#10B981",
                secondary: "#F8FAFC",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#F8FAFC",
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
