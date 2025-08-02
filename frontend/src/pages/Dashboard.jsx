import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import backgroundImg from "../components/image.jpeg";

const ORANGE = "#ff7300";
const BG = "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)";
const LIGHT_GREEN = "#e8f5e9";
const GREEN = "#4caf50";
const CARD_GRADIENT = "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)";
const ORANGE_GRADIENT = "linear-gradient(135deg, #ff7300 0%, #ff8c42 100%)";
const GREEN_GRADIENT = "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [survey, setSurvey] = useState(null);

  const [matches, setMatches] = useState([]);
  const [finalMatches, setFinalMatches] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [processingRequests, setProcessingRequests] = useState({});
<<<<<<< HEAD
=======
const [rejectedUserIds, setRejectedUserIds] = useState(new Set());

>>>>>>> 3510915ce39c19160572b313f53aa199b61f1745
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

<<<<<<< HEAD
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const profileRes = await api.get("/user/profile");
        setUser(profileRes.data);

        if (profileRes.data?.onboarding?.status === "completed") {
          setSurvey(profileRes.data?.onboarding?.answers ?? {});
          const [
            matchRes,
            finalMatchRes,
            incomingRes,
            acceptedRes,
            notificationsRes,
            pendingRes,
          ] = await Promise.all([
            api.get("/match"),
            api.get("/finalmatch"),
            api.get("/connection-requests/incoming"),
            api.get("/connection-requests/accepted"),
            api.get("/connection-requests/notifications"),
            api.get("/connection-requests/pending-sent"),
          ]);
          setMatches(matchRes.data || []);
          setFinalMatches(finalMatchRes.data || []);
          const filteredIncoming = (incomingRes.data || []).filter(
            (req) =>
              String(req.senderUserId._id || req.senderUserId) !==
              String(profileRes.data._id)
          );
          setIncomingRequests(filteredIncoming);
          setAcceptedConnections(acceptedRes.data || []);
          setNotifications(notificationsRes.data || []);
          setPendingRequests(
            (pendingRes.data || []).map((req) =>
              String(req.receiverUserId._id || req.receiverUserId)
            )
          );
        }
      } catch (err) {
        setError(
          "Failed to load: " + (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
=======
  // Fetch dashboard data
useEffect(() => {
  async function fetchDashboard() {
    try {
      const profileRes = await api.get("/user/profile");
      setUser(profileRes.data);

      if (profileRes.data?.onboarding?.status === "completed") {
        setSurvey(profileRes.data?.onboarding?.answers ?? {});

        // Fetch all required data in parallel
        const [
          matchRes,
          finalMatchRes,
          incomingRes,
          acceptedRes,
          notificationsRes,
          pendingRes,
          rejectedRes,
        ] = await Promise.all([
          api.get("/match"), // top matches candidate list
          api.get("/finalmatch"), // accepted matches with matchedUser info
          api.get("/connection-requests/incoming"),
          api.get("/connection-requests/accepted"),
          api.get("/connection-requests/notifications"),
          api.get("/connection-requests/pending-sent"),
          api.get("/connection-requests/rejected"),
        ]);

        // Process rejected user IDs from rejected connections
        const rejectedIds = new Set();
        (rejectedRes.data || []).forEach((conn) => {
          if (
            String(conn.senderUserId._id || conn.senderUserId) ===
            String(profileRes.data._id)
          ) {
            rejectedIds.add(String(conn.receiverUserId._id || conn.receiverUserId));
          } else {
            rejectedIds.add(String(conn.senderUserId._id || conn.senderUserId));
          }
        });
        setRejectedUserIds(rejectedIds);

        // Build a Set of userIds who are already matched with current user
        const matchedUserIds = new Set(
          finalMatchRes.data.map((m) => String(m.matchedUser._id))
        );

        // Optional: current user's number of matches
        const currentUserMatchesCount = finalMatchRes.data.length;

        // Filter matches accordingly
// 1. Filter matches accordingly first (inside filter callback no other code)
const filteredMatches = (matchRes.data || []).filter((match) => {
  const targetUserId = match.userId || match._id || (match.user && match.user._id);
  if (!targetUserId) return false;

  const userIdStr = String(targetUserId);

  if (matchedUserIds.has(userIdStr)) return false;
  if (rejectedIds.has(userIdStr)) return false;
  if (userIdStr === String(profileRes.data._id)) return false;

  return true;
});

// 2. Sort by compatibilityScore descending
const sortedMatches = filteredMatches.sort(
  (a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0)
);

// 3. Limit top 3
const topThreeMatches = sortedMatches.slice(0, 3);

// 4. Set state with limited matches
setMatches(topThreeMatches);


        setFinalMatches(finalMatchRes.data || []);

        const filteredIncoming = (incomingRes.data || []).filter(
          (req) =>
            String(req.senderUserId._id || req.senderUserId) !==
            String(profileRes.data._id)
        );
        setIncomingRequests(filteredIncoming);

        setAcceptedConnections(acceptedRes.data || []);
        setNotifications(notificationsRes.data || []);

        setPendingRequests(
          (pendingRes.data || []).map(
            (req) => String(req.receiverUserId._id || req.receiverUserId)
          )
        );
>>>>>>> 3510915ce39c19160572b313f53aa199b61f1745
      }
    } catch (err) {
      setError("Failed to load: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }
  fetchDashboard();
}, []);

  const getOtherUser = (conn) => {
    if (!user) return null;
    return String(conn.senderUserId._id) === String(user._id)
      ? conn.receiverUserId
      : conn.senderUserId;
  };

  const getMatchedConnection = (userId) => {
    if (!user) return null;
    return (
      acceptedConnections.find((conn) => {
        const userA = String(conn.senderUserId._id);
        const userB = String(conn.receiverUserId._id);
        const currentUserId = String(user._id);
        const otherUserId = String(userId);
        return (
          (userA === currentUserId && userB === otherUserId) ||
          (userB === currentUserId && userA === otherUserId)
        );
      }) || null
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login", { replace: true });
  };

  const getInitials = (first, last) => {
    if (!first && !last) return "";
    return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase();
  };

  const handleSendRequest = async (userId) => {
    if (pendingRequests.includes(userId)) return;
    try {
      await api.post("/connection-requests", { receiverUserId: userId });
      setPendingRequests((prev) => [...prev, userId]);
      alert("Connection request sent.");
    } catch (error) {
      alert(error.response?.data.message || "Failed to send request");
    }
  };

  // Mark notification read
  const handleMarkNotificationRead = async (notifId) => {
    try {
      await api.post("/connection-requests/notifications/mark-read", {
        notificationIds: [notifId],
      });
      setNotifications((prev) => prev.filter((n) => n._id !== notifId));
      const [acceptedRes, notificationsRes, pendingRes] = await Promise.all([
        api.get("/connection-requests/accepted"),
        api.get("/connection-requests/notifications"),
        api.get("/connection-requests/pending-sent"),
      ]);
      setAcceptedConnections(acceptedRes.data || []);
      setNotifications(notificationsRes.data || []);
      setPendingRequests(
        (pendingRes.data || []).map((req) =>
          String(req.receiverUserId._id || req.receiverUserId)
        )
      );
    } catch (error) {
      console.error("Failed to mark notification read", error);
    }
  };

<<<<<<< HEAD
  const handleRespondRequest = async (requestId, accept) => {
    setProcessingRequests((prev) => ({ ...prev, [requestId]: true }));
    try {
      const status = accept ? "accepted" : "rejected";
      await api.post(`/connection-requests/${requestId}/respond`, { status });
      setIncomingRequests((prev) => prev.filter((r) => r._id !== requestId));
      if (accept) {
        const acceptedRes = await api.get("/connection-requests/accepted");
        setAcceptedConnections(acceptedRes.data || []);
        alert(
          "Connection accepted! Please use the 'Go to Moodboard' button to navigate."
        );
=======
const handleRespondRequest = async (requestId, accept) => {
  setProcessingRequests(prev => ({ ...prev, [requestId]: true }));
  try {
    const status = accept ? "accepted" : "rejected";
    await api.post(`/connection-requests/${requestId}/respond`, { status });

    setIncomingRequests(prev => prev.filter((r) => r._id !== requestId));

    if (accept) {
      const acceptedRes = await api.get("/connection-requests/accepted");
      setAcceptedConnections(acceptedRes.data || []);
      alert("Connection accepted! Please use the 'Go to Moodboard' button to navigate.");
    } else {
      // On reject: remove rejected user from top matches immediately
      // Find rejected user's ID; incomingRequests has senderUserId
      const rejectedReq = incomingRequests.find(r => r._id === requestId);
      if (rejectedReq) {
        const rejectedUserId = String(rejectedReq.senderUserId._id || rejectedReq.senderUserId);
        // Remove from matches list
        setMatches(prev => prev.filter(m => {
          const matchUserId = m.userId || m._id || (m.user && m.user._id);
          return String(matchUserId) !== rejectedUserId;
        }));
        // Add rejectedUserId to rejectedUserIds Set locally to disable further connect attempts
        setRejectedUserIds(prev => new Set(prev).add(rejectedUserId));
>>>>>>> 3510915ce39c19160572b313f53aa199b61f1745
      }
    }
  } catch (error) {
    alert(error.response?.data.message || "Failed to respond");
  } finally {
    setProcessingRequests(prev => {
      const copy = { ...prev };
      delete copy[requestId];
      return copy;
    });
  }
};

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: BG,
          color: ORANGE,
          fontSize: 18,
          fontWeight: "600",
        }}
      >
        Loading dashboard...
      </div>
    );
  if (error)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: BG,
          color: "#dc3545",
          fontSize: 18,
          fontWeight: "600",
        }}
      >
        {error}
      </div>
    );
  if (!user)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: BG,
          color: "#dc3545",
          fontSize: 18,
          fontWeight: "600",
        }}
      >
        Profile not found
      </div>
    );
  if (user?.onboarding?.status !== "completed")
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Blurred background image */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            backgroundImage: `url(${backgroundImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(2px)",
            opacity: 0.6,
            zIndex: 0,
            pointerEvents: "none",
          }}
        ></div>

        {/* Content above background */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 25,
              padding: "12px 24px",
              fontWeight: "600",
              cursor: "pointer",
              zIndex: 3,
              fontSize: 14,
            }}
            aria-label="Logout"
            title="Logout"
          >
            Logout
          </button>
          <h1
            style={{
              color: ORANGE,
              fontWeight: "700",
              marginBottom: 24,
              fontSize: 32,
            }}
          >
            Welcome, {user.firstName}!
          </h1>
          <div
            style={{
              maxWidth: 500,
              backgroundColor: "white",
              padding: 40,
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 18, marginBottom: 24, color: "#6c757d" }}>
              Please complete your survey to find matches.
            </p>
            <button
              onClick={() => navigate("/survey")}
              style={{
                cursor: "pointer",
                padding: "16px 32px",
                fontSize: 16,
                backgroundColor: ORANGE,
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: "600",
              }}
            >
              Take Survey
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", background: BG, paddingBottom: 40 }}>
      {/* Header with Welcome and Logout */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)",
          padding: "20px 0",
          boxShadow: "0 4px 12px rgba(255,115,0,0.1)",
          marginBottom: 32,
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: "#343a40",
              margin: 0,
            }}
          >
            Welcome back, {user.firstName} {user.lastName}!
          </h1>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 25,
              padding: "10px 20px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: 14,
            }}
            aria-label="Logout"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
        {/* Profile Card */}
        <div
          style={{
            background: CARD_GRADIENT,
            borderRadius: 16,
            padding: 32,
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(255,115,0,0.15)",
            border: "1px solid rgba(255,115,0,0.1)",
            display: "flex",
            alignItems: "flex-start",
            gap: 24,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: ORANGE_GRADIENT,
              color: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 28,
              fontWeight: "700",
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(255,115,0,0.3)",
            }}
          >
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#343a40",
                marginBottom: 4,
              }}
            >
              {user.firstName} {user.lastName}
            </div>
            <div
              style={{
                color: "#6c757d",
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              {user.email}
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#495057",
                  marginBottom: 12,
                }}
              >
                Your Preferences
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                <div>
                  <span
                    style={{ color: ORANGE, fontSize: 14, fontWeight: "600" }}
                  >
                    Cleanliness:
                  </span>
                  <span style={{ marginLeft: 8, color: "#495057" }}>
                    {survey.cleanliness}
                  </span>
                </div>
                <div>
                  <span
                    style={{ color: ORANGE, fontSize: 14, fontWeight: "600" }}
                  >
                    Diet:
                  </span>
                  <span style={{ marginLeft: 8, color: "#495057" }}>
                    {survey.diet}
                  </span>
                </div>
                <div>
                  <span
                    style={{ color: ORANGE, fontSize: 14, fontWeight: "600" }}
                  >
                    Sleep Schedule:
                  </span>
                  <span style={{ marginLeft: 8, color: "#495057" }}>
                    {survey.sleepSchedule}
                  </span>
                </div>
                <div>
                  <span
                    style={{ color: ORANGE, fontSize: 14, fontWeight: "600" }}
                  >
                    Noise Tolerance:
                  </span>
                  <span style={{ marginLeft: 8, color: "#495057" }}>
                    {survey.noiseTolerance}
                  </span>
                </div>
                <div>
                  <span
                    style={{ color: ORANGE, fontSize: 14, fontWeight: "600" }}
                  >
                    Goal:
                  </span>
                  <span style={{ marginLeft: 8, color: "#495057" }}>
                    {survey.goal}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/survey")}
            style={{
              background: ORANGE_GRADIENT,
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontWeight: "600",
              fontSize: 14,
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(255,115,0,0.25)",
            }}
          >
            Edit Survey
          </button>
        </div>

        {/* Your Matches */}
        {finalMatches.length > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
              borderRadius: 16,
              padding: 24,
              marginBottom: 32,
              boxShadow: "0 8px 32px rgba(76,175,80,0.15)",
              border: "1px solid rgba(76,175,80,0.2)",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#2e7d32",
                marginBottom: 16,
              }}
            >
              Your Matches
            </h2>
            {finalMatches.map((match) => {
              if (
                !match.matchedUser ||
                String(match.matchedUser._id) === String(user._id)
              )
                return null;
              const other = match.matchedUser;
              return (
                <div
                  key={match._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: finalMatches.length > 1 ? 16 : 0,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: ORANGE_GRADIENT,
                      color: "#fff",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 18,
                      fontWeight: "600",
                      boxShadow: "0 3px 12px rgba(255,115,0,0.3)",
                    }}
                  >
                    {getInitials(other.firstName, other.lastName)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#2e7d32",
                        fontSize: 16,
                      }}
                    >
                      {other.firstName} {other.lastName}
                    </div>
                    <div
                      style={{
                        color: "#4caf50",
                        fontSize: 14,
                      }}
                    >
                      {other.email}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={() => {
                        if (finalMatches[0])
                          navigate(`/moodboard/${finalMatches[0]._id}`);
                      }}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)",
                        color: GREEN,
                        border: `2px solid ${GREEN}`,
                        borderRadius: 8,
                        padding: "8px 16px",
                        fontWeight: "600",
                        fontSize: 14,
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(76,175,80,0.2)",
                      }}
                    >
                      Go to Moodboard
                    </button>
                    <button
                      onClick={() => {
                        if (finalMatches[0])
                          navigate(`/room-allocation/${finalMatches[0]._id}`);
                      }}
                      style={{
                        background: ORANGE_GRADIENT,
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 16px",
                        fontWeight: "600",
                        fontSize: 14,
                        cursor: "pointer",
                        boxShadow: "0 3px 12px rgba(255,115,0,0.3)",
                      }}
                    >
                      Allocate Room
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Top Roommate Matches */}
        <div
          style={{
            background: CARD_GRADIENT,
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 8px 32px rgba(255,115,0,0.1)",
            border: "1px solid rgba(255,115,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#343a40",
                margin: 0,
              }}
            >
              Top Roommate Matches
            </h2>
            <button
              style={{
                backgroundColor: "transparent",
                color: ORANGE,
                border: `2px solid ${ORANGE}`,
                borderRadius: 8,
                padding: "8px 16px",
                fontWeight: "600",
                fontSize: 14,
                cursor: "pointer",
              }}
              onClick={() => {
                // Find roommates action if required
              }}
            >
              Take Survey
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
            }}
          >
            {matches.length === 0 && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  color: "#6c757d",
                  fontSize: 16,
                  padding: 40,
                }}
              >
                No matches yet, please update your survey.
              </div>
            )}
<<<<<<< HEAD
            {matches.map((match) => {
              const targetUserId = match.userId || match._id || null;
              if (!targetUserId || String(targetUserId) === String(user._id))
                return null;
              const matchedConnection = getMatchedConnection(targetUserId);
              const sent = pendingRequests.includes(targetUserId);
              const firstName =
                match.firstName || (match.user && match.user.firstName) || "";
              const lastName =
                match.lastName || (match.user && match.user.lastName) || "";
              return (
                <div
                  key={targetUserId}
                  style={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
                    border: "1px solid rgba(255,115,0,0.1)",
                    borderRadius: 12,
                    padding: 24,
                    textAlign: "center",
                    boxShadow: "0 4px 16px rgba(255,115,0,0.08)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-4px)";
                    e.target.style.boxShadow = "0 8px 32px rgba(255,115,0,0.2)";
                    e.target.style.background =
                      "linear-gradient(135deg, #ffffff 0%, #fff8f0 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 4px 16px rgba(255,115,0,0.08)";
                    e.target.style.background =
                      "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)";
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      background: ORANGE_GRADIENT,
                      color: "#fff",
                      borderRadius: "50%",
                      display: "flex",
                      fontWeight: "700",
                      fontSize: 24,
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      boxShadow: "0 4px 16px rgba(255,115,0,0.3)",
                    }}
                  >
                    {getInitials(firstName, lastName)}
                  </div>

                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#343a40",
                      marginBottom: 8,
                    }}
                  >
                    {firstName} {lastName}
                  </div>

                  <div
                    style={{
                      display: "inline-block",
                      background: "#fff3cd",
                      border: "1px solid #ffeeba",
                      borderRadius: 20,
                      color: "#856404",
                      fontWeight: "600",
                      fontSize: 14,
                      padding: "4px 12px",
                      marginBottom: 16,
                    }}
                  >
                    Score: {match.score}
                  </div>

                  {match.reasons && (
                    <div
                      style={{
                        textAlign: "left",
                        marginBottom: 20,
                        background: "#f8f9fa",
                        borderRadius: 8,
                        padding: 16,
                      }}
                    >
                      {match.reasons.map((reason, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                            marginBottom: i < match.reasons.length - 1 ? 8 : 0,
                            fontSize: 14,
                            color: "#495057",
                            lineHeight: 1.4,
                          }}
                        >
                          <span
                            style={{
                              color: GREEN,
                              fontWeight: "bold",
                              flexShrink: 0,
                            }}
                          >
                            •
                          </span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchedConnection ? (
                    <button
                      onClick={() =>
                        navigate(`/moodboard/${matchedConnection._id}`)
                      }
                      style={{
                        backgroundColor: GREEN,
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontWeight: "600",
                        padding: "12px 0",
                        fontSize: 14,
                        width: "100%",
                        cursor: "pointer",
                      }}
                    >
                      Go to Moodboard
                    </button>
                  ) : (
                    <button
                      onClick={() => !sent && handleSendRequest(targetUserId)}
                      disabled={sent}
                      style={{
                        backgroundColor: sent ? "#6c757d" : ORANGE,
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        padding: "12px 0",
                        fontWeight: "600",
                        fontSize: 14,
                        width: "100%",
                        cursor: sent ? "not-allowed" : "pointer",
                        opacity: sent ? 0.7 : 1,
                      }}
                    >
                      {sent ? "Request Sent" : "Connect"}
                    </button>
                  )}
                </div>
              );
            })}
=======

         {matches.map((match) => {
  // Get the unique user ID for this match
  const targetUserId = match.userId || match._id || (match.user && match.user._id);
  if (!targetUserId || String(targetUserId) === String(user._id)) return null;

  // Check if already matched
  const matchedConnection = getMatchedConnection(targetUserId);

  // Check if a request was sent and pending
  const sent = pendingRequests.includes(targetUserId);

  // Check if this user is in rejectedUserIds state (you must define this in your component state)
  const isRejected = rejectedUserIds.has(String(targetUserId));

  // Check if current user reached max accepted matches (2)
  const currentUserMaxedOut = finalMatches.length >= 2;

  // Determine if Connect button should be disabled
  const disableConnect =
    !!matchedConnection || sent || isRejected || currentUserMaxedOut;

  // Get names safely
  const firstName = match.firstName || (match.user && match.user.firstName) || "";
  const lastName = match.lastName || (match.user && match.user.lastName) || "";

  return (
    <article
      key={targetUserId}
      style={{
        width: 220,
        backgroundColor: "#fff7ea",
        padding: 15,
        borderRadius: 10,
        boxShadow: "0 0 8px rgba(0, 0, 0, 0.03)",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          backgroundColor: ORANGE,
          color: "white",
          fontSize: 32,
          fontWeight: "800",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 15,
          userSelect: "none",
        }}
      >
        {getInitials(firstName, lastName)}
      </div>
      <h3 style={{ margin: 0, marginBottom: 10, color: "#ad6c02" }}>
        {firstName} {lastName}
      </h3>
     <p style={{ margin: 0, marginBottom: 12, fontWeight: "700", color: "#b47900" }}>
  Score: {match.compatibilityScore}%
</p>
{match.compatibilityReasons && (
  <ul
    style={{
      listStyle: "none",
      paddingLeft: 20,
      marginBottom: 20,
      fontSize: 14,
      color: "#7f5e00",
    }}
  >
    {match.compatibilityReasons.map((r, i) => (
      <li key={i}>• {r}</li>
    ))}
  </ul>
)}


      {matchedConnection ? (
        <button
          onClick={() => navigate(`/moodboard/${matchedConnection._id}`)}
          style={{
            backgroundColor: "#4e9940",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: "600",
            width: "100%",
          }}
        >
          Go to Moodboard
        </button>
      ) : (
        <button
          onClick={() => !disableConnect && handleSendRequest(targetUserId)}
          disabled={disableConnect}
          style={{
            backgroundColor: disableConnect ? "#ccc" : ORANGE,
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
            cursor: disableConnect ? "not-allowed" : "pointer",
            fontWeight: "600",
            width: "100%",
          }}
          title={
            disableConnect
              ? matchedConnection
                ? "Already matched"
                : sent
                ? "Request already sent"
                : isRejected
                ? "You were rejected by this user"
                : currentUserMaxedOut
                ? "You have reached maximum matches"
                : "Unavailable"
              : "Send connection request"
          }
        >
          {sent ? "Request Sent" : disableConnect ? "Unavailable" : "Connect"}
        </button>
      )}
    </article>
  );
})}

>>>>>>> 3510915ce39c19160572b313f53aa199b61f1745
          </div>
        </div>
      </div>
    </div>
  );
}
