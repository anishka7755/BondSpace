import React, { useEffect, useState } from "react";
import api from "../api/api"; // axios instance with baseURL and auth header set
import { useNavigate } from "react-router-dom";

const ORANGE = "#ff7300";
const BG = "#fff6ef";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [survey, setSurvey] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const profileRes = await api.get("/user/profile");
        setUser(profileRes.data);

        if (profileRes.data?.onboarding?.status === "completed") {
          setSurvey(profileRes.data?.onboarding?.answers ?? {});

        }
      } catch (err) {
        setError("Failed to load: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

 


  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login", { replace: true });
  };

  const getInitials = (first, last) => {
    if (!first && !last) return "";
    return (first?.[0] ?? "") + (last?.[0] ?? "");
  };


  if (loading)
    return (
      <div style={{ color: ORANGE, padding: 20, fontWeight: "bold" }}>
        Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div style={{ color: "red", padding: 20, fontWeight: "bold" }}>
        {error}
      </div>
    );

  if (!user)
    return (
      <div style={{ color: "red", padding: 20, fontWeight: "bold" }}>
        Profile not found
      </div>
    );

  if (user?.onboarding?.status !== "completed")
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: 20,
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            backgroundColor: ORANGE,
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "10px 22px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          aria-label="Logout"
          title="Logout"
        >
          Logout
        </button>

        <h1 style={{ color: ORANGE, fontWeight: "900", marginBottom: 18 }}>
          Welcome, {user.firstName}
        </h1>

        <div
          style={{
            maxWidth: 480,
            backgroundColor: "white",
            padding: 32,
            borderRadius: 10,
            boxShadow: "0 0 10px rgba(255,115,0,0.3)",
            borderLeft: `6px solid ${ORANGE}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 18 }}>Please complete your survey to find matches.</p>
          <button
            onClick={() => navigate("/survey")}
            style={{
              cursor: "pointer",
              padding: "16px 40px",
              fontSize: 20,
              backgroundColor: ORANGE,
              color: "white",
              border: "none",
              borderRadius: 6,
              fontWeight: "600",
              marginTop: 20,
            }}
          >
            Take Survey
          </button>
        </div>
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", background: BG, position: "relative" }}>
      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          position: "fixed",
          top: 20,
          right: 40,
          zIndex: 99,
          backgroundColor: ORANGE,
          color: "white",
          border: "none",
          borderRadius: 6,
          padding: "10px 22px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
        aria-label="Logout"
        title="Logout"
      >
        Logout
      </button>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "36px 0 60px" }}>
        <h1 style={{ color: ORANGE }}>Welcome back, {user.firstName}!</h1>

       

        {/* Profile + Preferences */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 10,
            boxShadow: "0 0 15px rgba(255,115,0,0.15)",
            borderLeft: `6px solid ${ORANGE}`,
            padding: 25,
            marginBottom: 30,
            display: "flex",
            gap: 32,
          }}
        >
          <div style={{ minWidth: 160, textAlign: "center" }}>
            <div
              style={{
                width: 86,
                height: 86,
                borderRadius: "50%",
                backgroundColor: ORANGE,
                color: "white",
                fontSize: 48,
                fontWeight: "800",
                lineHeight: "86px",
                userSelect: "none",
                margin: "0 auto 15px",
              }}
            >
              {getInitials(user.firstName, user.lastName)}
            </div>
            <h3 style={{ margin: 0 }}>
              {user.firstName} {user.lastName}
            </h3>
            <p style={{ margin: "10px 0", color: "#7f5e00" }}>{user.email}</p>
            <button
              onClick={() => navigate("/survey")}
              style={{
                backgroundColor: ORANGE,
                color: "white",
                border: "none",
                borderRadius: 6,
                padding: "8px 22px",
                fontWeight: "600",
                cursor: "pointer",
                marginTop: 12,
              }}
            >
              Edit Survey
            </button>
          </div>

          <div>
            <h3 style={{ color: ORANGE }}>Your Preferences</h3>
            <ul
              style={{
                listStyle: "none",
                paddingLeft: 20,
                color: "#7f5e00",
                fontSize: 16,
              }}
            >
              <li>
                <b>Cleanliness:</b> {survey.cleanliness}
              </li>
              <li>
                <b>Sleep Schedule:</b> {survey.sleepSchedule}
              </li>
              <li>
                <b>Diet:</b> {survey.diet}
              </li>
              <li>
                <b>Noise Tolerance:</b> {survey.noiseTolerance}
              </li>
              <li>
                <b>Goal:</b> {survey.goal}
              </li>
            </ul>
          </div>
        </div>

       

        {/* Top Roommate Matches (from matches) */}
        <section
          style={{
            backgroundColor: "white",
            borderRadius: 10,
            padding: 25,
            boxShadow: `0 0 15px rgba(255, 115, 0, 0.15)`,
            borderLeft: `6px solid ${ORANGE}`,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h2 style={{ color: ORANGE }}>Top Roommate Matches</h2>
            <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  }}
>
  <h2 style={{ color: ORANGE }}>Find Roomates</h2>
  {/* Removed Find Roommates button */}
</div>

          </div>

         
        </section>
      </div>
    </div>
  );
}
