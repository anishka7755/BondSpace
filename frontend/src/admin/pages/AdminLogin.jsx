import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Home } from "lucide-react";
import api from "../api/adminApi";
import { setAuthData } from "../../utils/authHelpers";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/admin/login", form);
      if (res.data.token && res.data.admin) {
        setAuthData(res.data.token, { ...res.data.admin, role: "admin" });
        navigate("/admin/admindashboard");
      } else {
        setError("Invalid admin credentials.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-lavender-50 to-white dark:from-black dark:to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo (match reference file) */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="bg-gradient-to-r from-rose-500 to-lavender-500 p-2 rounded-lg shadow-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-lavender-600 dark:from-rose-400 dark:to-lavender-400 bg-clip-text text-transparent">
              BondSpace
            </span>
          </Link>
        </div>
        <Card className="shadow-xl border-0 bg-white dark:bg-gray-900/90">
          <CardHeader>
            <CardTitle className="text-center text-2xl mb-1">
              Admin Login
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <Input
                name="email"
                type="email"
                placeholder="Admin email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-500 to-lavender-500"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </CardContent>
            {/* CardFooter and Login as user button */}
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="button"
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm"
                onClick={() => navigate("/login")}
              >
                Login as user
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
