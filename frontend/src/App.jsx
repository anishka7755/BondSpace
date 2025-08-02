import "./index.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import SurveyPage from "./pages/SurveyPage";
import NotFound from "./pages/NotFound";
import RoomAllocationPage from "./pages/RoomAllocationPage.jsx";
import Moodboard from "./pages/MoodBoard"; // Adjust the path if filename differs

import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import UserManagement from "./admin/pages/UserManagement";
import RoomManagement from "./admin/pages/RoomManagement";
import MatchManagement from "./admin/pages/MatchManagement";
import AuditLog from "./admin/pages/AuditLog";

import AdminProtectedRoute from "./admin/components/AdminProtectedRoute";

import { getStoredUser, getToken } from "./utils/authHelpers";

const queryClient = new QueryClient();

// Route guard for authenticated users
function ProtectedRoute({ children }) {
  const user = getStoredUser();
  const token = getToken();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Route guard for guests
function GuestRoute({ children }) {
  const user = getStoredUser();

  if (user) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const user = getStoredUser();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Root path redirects based on auth and role */}
              <Route
                path="/"
                element={
                  user ? (
                    user.role === "admin" ? (
                      <Navigate to="/admin" replace />
                    ) : (
                      <Navigate to="/dashboard" replace />
                    )
                  ) : (
                    <Index />
                  )
                }
              />

              {/* Admin base redirect */}
              <Route path="/admin" element={<Navigate to="/admin/admindashboard" replace />} />

              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                }
              />

              {/* Protected user routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
               path="/room-allocation/:matchId" 
               element={
                 <ProtectedRoute>
                  <RoomAllocationPage />
                  </ProtectedRoute>} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/survey"
                element={
                  <ProtectedRoute>
                    <SurveyPage />
                  </ProtectedRoute>
                }
              />

              {/* Moodboard route with dynamic matchId param, protected */}
              <Route
                path="/moodboard/:matchId"
                element={
                  <ProtectedRoute>
                    <Moodboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route
                path="/admin/admindashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminProtectedRoute>
                    <UserManagement />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/rooms"
                element={
                  <AdminProtectedRoute>
                    <RoomManagement />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/matches"
                element={
                  <AdminProtectedRoute>
                    <MatchManagement />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/audit"
                element={
                  <AdminProtectedRoute>
                    <AuditLog />
                  </AdminProtectedRoute>
                }
              />

              {/* 404 catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")).render(<App />);
