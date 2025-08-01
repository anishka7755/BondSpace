import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    api
      .get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => {
        setError("Failed to load profile");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      });
  }, [navigate]);

  const goToSurvey = () => {
    navigate("/survey");
  };

  if (error) return <p className="text-red-600 mt-10 text-center">{error}</p>;

  if (!user) return <p className="mt-10 text-center">Loading profile...</p>;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome, {user.firstName} {user.lastName}!
        </h2>

        <div className="space-y-3 text-gray-700 text-base">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Onboarding Status:</strong>{" "}
            <span
              className={`px-2 py-1 rounded-full text-sm font-semibold ${
                user.onboarding?.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {user.onboarding?.status}
            </span>
          </p>
        </div>

        <button
          onClick={goToSurvey}
          className="mt-8 w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {user.onboarding?.status === "completed"
            ? "Update Survey"
            : "Take Survey"}
        </button>
      </div>
    </div>
  );
}
