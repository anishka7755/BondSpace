import React, { useEffect, useState } from "react";
import api from "../api/api"; // axios instance with baseURL and auth header set
import { useNavigate } from "react-router-dom";

const ORANGE = "#ff7300";
const BG = "#fff6ef";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [survey, setSurvey] = useState(null);

  // Top matches candidates from /match
  const [matches, setMatches] = useState([]);

  // Accepted matches from /finalmatch, enriched with matchedUser info
  const [finalMatches, setFinalMatches] = useState([]);

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [processingRequests, setProcessingRequests] = useState({});
const [rejectedUserIds, setRejectedUserIds] = useState(new Set());

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
      }
    } catch (err) {
      setError("Failed to load: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }
  fetchDashboard();
}, []);

  // Get the user object that is "other" in a connection relative to current user
  const getOtherUser = (conn) => {
    if (!user) return null;
    return String(conn.senderUserId._id) === String(user._id)
      ? conn.receiverUserId
      : conn.senderUserId;
  };

  // Returns accepted connection object for given userId (if any)
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
    return (first?.[0] ?? "") + (last?.[0] ?? "");
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
        (pendingRes.data || []).map(
          (req) => String(req.receiverUserId._id || req.receiverUserId)
        )
      );
    } catch (error) {
      console.error("Failed to mark notification read", error);
    }
  };

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

        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <section
            style={{
              backgroundColor: "#fff9e6",
              borderRadius: 10,
              padding: 20,
              borderLeft: `6px solid ${ORANGE}`,
              marginBottom: 30,
              boxShadow: "0 0 8px rgba(255, 115, 0, 0.2)",
            }}
          >
            <h2 style={{ color: ORANGE, marginBottom: 15 }}>Notifications</h2>

            {notifications.map((notif) => (
              <div
                key={notif._id}
                style={{
                  backgroundColor: "white",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 10,
                  boxShadow: "0 0 5px rgba(0,0,0,0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>{notif.message}</div>
                <button
                  onClick={() => handleMarkNotificationRead(notif._id)}
                  style={{
                    backgroundColor: ORANGE,
                    color: "white",
                    border: "none",
                    padding: "4px 10px",
                    borderRadius: 5,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Mark Read
                </button>
              </div>
            ))}
          </section>
        )}

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

        {/* Incoming Connection Requests */}
        {incomingRequests.length > 0 && (
          <section
            style={{
              backgroundColor: "#f2fff1",
              borderRadius: 10,
              padding: 20,
              borderLeft: "6px solid #72a842",
              marginBottom: 30,
              boxShadow: "0 0 8px rgba(114,168,66,0.2)",
            }}
          >
            <h2 style={{ color: "#4d7e1a", marginBottom: 15 }}>
              Pending Connection Requests
            </h2>

            {incomingRequests.map((req) => {
              const sender = req.senderUserId;
              return (
                <div
                  key={req._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "white",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 10,
                    boxShadow: "0 0 5px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        backgroundColor: ORANGE,
                        color: "white",
                        fontWeight: "800",
                        fontSize: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        userSelect: "none",
                      }}
                    >
                      {getInitials(sender.firstName, sender.lastName)}
                    </div>
                    <div>
                      <div>
                        <strong>
                          {sender.firstName} {sender.lastName}
                        </strong>
                      </div>
                      <div style={{ fontSize: 14, color: "#555" }}>{sender.email}</div>
                    </div>
                  </div>
                  <div>
                    <button
                      disabled={processingRequests[req._id]}
                      onClick={() => handleRespondRequest(req._id, true)}
                      style={{
                        backgroundColor: ORANGE,
                        color: "white",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: 6,
                        marginRight: 10,
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Accept
                    </button>
                    <button
                      disabled={processingRequests[req._id]}
                      onClick={() => handleRespondRequest(req._id, false)}
                      style={{
                        backgroundColor: "#aaa",
                        color: "black",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Accepted Matches (from finalMatches) */}
        {finalMatches.length > 0 && (
          <section
            style={{
              backgroundColor: "#e1f3d1",
              borderRadius: 10,
              padding: 20,
              borderLeft: "6px solid #4e9940",
              marginBottom: 30,
              boxShadow: "0 0 8px rgba(78,153,64,0.2)",
            }}
          >
            <h2 style={{ color: "#3a8127", marginBottom: 15 }}>Your Matches</h2>

            {finalMatches.map((match) => {
              if (!match.matchedUser || String(match.matchedUser._id) === String(user._id))
                return null;

              const other = match.matchedUser;

              return (
                <div
                  key={match._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "white",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 10,
                    boxShadow: "0 0 5px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        backgroundColor: ORANGE,
                        color: "white",
                        fontWeight: "800",
                        fontSize: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        userSelect: "none",
                      }}
                    >
                      {getInitials(other.firstName, other.lastName)}
                    </div>
                    <div>
                      <div>
                        <strong>
                          {other.firstName} {other.lastName}
                        </strong>
                      </div>
                      <div style={{ fontSize: 14, color: "#555" }}>{other.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/moodboard/${match._id}`)}
                    style={{
                      backgroundColor: "#4e9940",
                      color: "white",
                      border: "none",
                      padding: "6px 16px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Go to Moodboard
                  </button>
                  <button onClick={() => navigate(`/room-allocation/${match._id}`)} style={{
                      backgroundColor: ORANGE, color: "white",
                      border: "none", borderRadius: 6, padding: "6px 14px",
                      fontWeight: "600", cursor: "pointer",
                    }}>
                      Allocate Room
                    </button>
                </div>
              );
            })}
          </section>
        )}

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

          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              justifyContent: matches.length ? "flex-start" : "center",
            }}
          >
            {matches.length === 0 && (
              <p style={{ color: "#a46300", fontWeight: "bold" }}>
                No matches yet, please update your survey.
              </p>
            )}

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

          </div>
        </section>
      </div>
    </div>
  );
}
