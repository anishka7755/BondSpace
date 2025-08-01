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
import SurveyPage from "./pages/SurveyPage";
import NotFound from "./pages/NotFound";

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
                path="/survey"
                element={
                  <ProtectedRoute>
                    <SurveyPage />
                  </ProtectedRoute>
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
