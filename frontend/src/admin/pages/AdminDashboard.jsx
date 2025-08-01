import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/adminApi"; // your axios instance with token interceptor

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    {
      label: "Users",
      value: 0,
      color: "from-rose-500 to-lavender-500",
      icon: "👩‍💻",
      link: "/admin/users",
      description: "Manage users, edit details, delete accounts",
    },
    {
      label: "Rooms",
      value: 0,
      color: "from-sage-500 to-blush-500",
      icon: "🏠",
      link: "/admin/rooms",
      description: "Add or modify rooms and room details",
    },
    {
      label: "Matches",
      value: 0,
      color: "from-gold-500 to-lavender-600",
      icon: "✨",
      link: "/admin/matches",
      description: "View and manage match results",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [usersRes, roomsRes, matchesRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/rooms"),
          api.get("/admin/matches"), // Fetch all matches
        ]);

        setStats((prevStats) =>
          prevStats.map((stat) => {
            if (stat.label === "Users")
              return { ...stat, value: usersRes.data.length };
            if (stat.label === "Rooms")
              return { ...stat, value: roomsRes.data.length };
            if (stat.label === "Matches")
              return { ...stat, value: matchesRes.data.length };
            return stat;
          })
        );
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user"); // adjust if used
          navigate("/admin/login");
        } else {
          setError(err.response?.data?.message || "Failed to fetch stats");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Admin Dashboard
      </h1>

      {loading && <p>Loading stats...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map(({ label, value, color, icon, link, description }) => (
              <Link
                key={label}
                to={link}
                className={`block bg-gradient-to-r ${color} rounded-xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transition-transform`}
                title={description}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-5xl">{icon}</span>
                  <div>
                    <div className="text-3xl font-bold text-white">{value}</div>
                    <div className="text-white text-lg">{label}</div>
                  </div>
                </div>
                <p className="mt-4 text-white text-sm">{description}</p>
              </Link>
            ))}
          </div>

          {/* New section: Check Audit Logs link */}
          <div className="mt-8">
            <Link
              to="/admin/audit"
              className="inline-block text-blue-600 hover:underline font-semibold"
            >
              Check Audit Logs &rarr;
            </Link>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
