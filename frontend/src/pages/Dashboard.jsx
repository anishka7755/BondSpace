import React, { useEffect, useState } from "react";
import api from "../api/api"; // axios instance with baseURL and auth header set
import { useNavigate } from "react-router-dom";


const ORANGE = "#FF6B35";
const BG = "#F8F9FA";
const CARD_BG = "#FFFFFF";
const TEXT_PRIMARY = "#2C3E50";
const TEXT_SECONDARY = "#7F8C8D";
const SUCCESS_GREEN = "#27AE60";
const LIGHT_GREEN_BG = "#E8F5E8";


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

  // New state: room allocations keyed by matchId
  const [roomAllocations, setRoomAllocations] = useState({});

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
              rejectedIds.add(
                String(conn.receiverUserId._id || conn.receiverUserId)
              );
            } else {
              rejectedIds.add(
                String(conn.senderUserId._id || conn.senderUserId)
              );
            }
          });
          setRejectedUserIds(rejectedIds);

          // Build a Set of userIds who are already matched with current user
          const matchedUserIds = new Set(
            finalMatchRes.data.map((m) => String(m.matchedUser._id))
          );

          // Filter matches accordingly first
          const filteredMatches = (matchRes.data || []).filter((match) => {
            const targetUserId =
              match.userId || match._id || (match.user && match.user._id);
            if (!targetUserId) return false;

            const userIdStr = String(targetUserId);

            if (matchedUserIds.has(userIdStr)) return false;
            if (rejectedIds.has(userIdStr)) return false;
            if (userIdStr === String(profileRes.data._id)) return false;

            return true;
          });

          // Sort by compatibilityScore descending
          const sortedMatches = filteredMatches.sort(
            (a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0)
          );

          // Limit top 3
          const topThreeMatches = sortedMatches.slice(0, 3);

          // Set state with limited matches
          setMatches(topThreeMatches);
          setFinalMatches(finalMatchRes.data || []);
          setIncomingRequests(
            (incomingRes.data || []).filter(
              (req) =>
                String(req.senderUserId._id || req.senderUserId) !==
                String(profileRes.data._id)
            )
          );
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
      }
    }
    fetchDashboard();
  }, []);

  // New effect: fetch room allocations for accepted matches
  useEffect(() => {
    async function fetchRoomAllocations() {
      if (!finalMatches.length) return;

      try {
        const allocationsPromises = finalMatches.map(async (match) => {
          const res = await api.get(`/room-allocations/${match._id}`);
          return { matchId: match._id, allocation: res.data };
        });

        const allocationsResults = await Promise.all(allocationsPromises);
        const allocationsMap = {};
        allocationsResults.forEach(({ matchId, allocation }) => {
          allocationsMap[matchId] = allocation;
        });

        setRoomAllocations(allocationsMap);
      } catch (error) {
        console.error("Failed to fetch room allocations", error);
      }
    }
    fetchRoomAllocations();
  }, [finalMatches]);

  // Compute whether current user already has a room allocated (in any final match)
  const hasAllocatedRoom = React.useMemo(() => {
    if (!user || !finalMatches.length) return false;
    return finalMatches.some((match) => {
      const allocation = roomAllocations[match._id];
      return allocation?.selectedRoomId ? true : false;
    });
  }, [user, finalMatches, roomAllocations]);

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

    if (hasAllocatedRoom) {
      alert("You have already been allocated a room and cannot connect with others.");
      return;
    }

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
        (pendingRes.data || []).map((req) =>
          String(req.receiverUserId._id || req.receiverUserId)
        )
      );
    } catch (error) {
      console.error("Failed to mark notification read", error);
    }
  };

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
      } else {
        // On reject: remove rejected user from top matches immediately
        const rejectedReq = incomingRequests.find((r) => r._id === requestId);
        if (rejectedReq) {
          const rejectedUserId = String(
            rejectedReq.senderUserId._id || rejectedReq.senderUserId
          );
          setMatches((prev) =>
            prev.filter((m) => {
              const matchUserId = m.userId || m._id || (m.user && m.user._id);
              return String(matchUserId) !== rejectedUserId;
            })
          );
          setRejectedUserIds((prev) => new Set(prev).add(rejectedUserId));
        }
      }
    } catch (error) {
      alert(error.response?.data.message || "Failed to respond");
    } finally {
      setProcessingRequests((prev) => {
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
          color: "#E74C3C",
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
          color: "#E74C3C",
          fontSize: 18,
          fontWeight: "600",
        }}
      >
        Profile not found
      </div>
    );

  if (user?.onboarding?.status !== "completed")
    return (
      <div style={{ minHeight: "100vh", background: BG, padding: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <h1
            style={{
              color: TEXT_PRIMARY,
              fontSize: "28px",
              fontWeight: "700",
              margin: 0,
            }}
          >
            Welcome, {user.firstName}
          </h1>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#E74C3C",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Logout
          </button>
        </div>

        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: CARD_BG,
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: TEXT_PRIMARY,
              marginBottom: "20px",
              fontSize: "24px",
              fontWeight: "600",
            }}
          >
            Complete Your Profile
          </h2>
          <p
            style={{
              color: TEXT_SECONDARY,
              fontSize: "16px",
              marginBottom: "30px",
            }}
          >
            Please complete your survey to find compatible roommates.
          </p>
          <button
            onClick={() => navigate("/survey")}
            style={{
              backgroundColor: ORANGE,
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "16px 32px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Take Survey
          </button>
        </div>
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: CARD_BG,
          padding: "20px 40px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              color: TEXT_PRIMARY,
              fontSize: "28px",
              fontWeight: "700",
              margin: 0,
            }}
          >
            Welcome back, {user.firstName}!
          </h1>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#E74C3C",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px 60px" }}
      >
        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div
            style={{
              backgroundColor: "#FFF3CD",
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "30px",
              border: "1px solid #FFEAA7",
            }}
          >
            <h2
              style={{
                color: "#856404",
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              Notifications
            </h2>

            {notifications.map((notif) => (
              <div
                key={notif._id}
                style={{
                  backgroundColor: CARD_BG,
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid #F1F2F6",
                }}
              >
                <div style={{ color: TEXT_PRIMARY }}>{notif.message}</div>
                <button
                  onClick={() => handleMarkNotificationRead(notif._id)}
                  style={{
                    backgroundColor: ORANGE,
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  Mark Read
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Profile Card */}
        <div
          style={{
            backgroundColor: CARD_BG,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            padding: "32px",
            marginBottom: "30px",
            display: "flex",
            gap: "40px",
            alignItems: "flex-start",
          }}
        >
          <div style={{ textAlign: "center", minWidth: "200px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: ORANGE,
                color: "white",
                fontSize: "32px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                userSelect: "none",
              }}
            >
              {getInitials(user.firstName, user.lastName)}
            </div>
            <h3
              style={{
                margin: "0 0 8px 0",
                color: TEXT_PRIMARY,
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              {user.firstName} {user.lastName}
            </h3>
            <p
              style={{
                margin: "0 0 20px 0",
                color: TEXT_SECONDARY,
                fontSize: "14px",
              }}
            >
              {user.email}
            </p>
            <button
              onClick={() => navigate("/survey")}
              style={{
                backgroundColor: ORANGE,
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Edit Survey
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <h3
              style={{
                color: TEXT_PRIMARY,
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              Your Preferences
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                color: TEXT_SECONDARY,
              }}
            >
              <div>
                <strong style={{ color: TEXT_PRIMARY }}>Cleanliness:</strong>{" "}
                {survey.cleanliness}
              </div>
              <div>
                <strong style={{ color: TEXT_PRIMARY }}>Sleep Schedule:</strong>{" "}
                {survey.sleepSchedule}
              </div>
              <div>
                <strong style={{ color: TEXT_PRIMARY }}>Diet:</strong> {survey.diet}
              </div>
              <div>
                <strong style={{ color: TEXT_PRIMARY }}>
                  Noise Tolerance:
                </strong>{" "}
                {survey.noiseTolerance}
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <strong style={{ color: TEXT_PRIMARY }}>Goal:</strong> {survey.goal}
              </div>
            </div>
          </div>
        </div>

        {/* Incoming Connection Requests */}
        {incomingRequests.length > 0 && (
          <div
            style={{
              backgroundColor: LIGHT_GREEN_BG,
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "30px",
              border: "1px solid #A8E6CF",
            }}
          >
            <h2
              style={{
                color: SUCCESS_GREEN,
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
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
                    backgroundColor: CARD_BG,
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    border: "1px solid #F1F2F6",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        backgroundColor: ORANGE,
                        color: "white",
                        fontWeight: "700",
                        fontSize: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        userSelect: "none",
                      }}
                    >
                      {getInitials(sender.firstName, sender.lastName)}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          color: TEXT_PRIMARY,
                          fontSize: "16px",
                        }}
                      >
                        {sender.firstName} {sender.lastName}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: TEXT_SECONDARY,
                        }}
                      >
                        {sender.email}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      disabled={processingRequests[req._id]}
                      onClick={() => handleRespondRequest(req._id, true)}
                      style={{
                        backgroundColor: SUCCESS_GREEN,
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Accept
                    </button>
                    <button
                      disabled={processingRequests[req._id]}
                      onClick={() => handleRespondRequest(req._id, false)}
                      style={{
                        backgroundColor: "#95A5A6",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Your Matches */}
        {finalMatches.length > 0 && (
          <div
            style={{
              backgroundColor: LIGHT_GREEN_BG,
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "30px",
              border: "1px solid #A8E6CF",
            }}
          >
            <h2
              style={{
                color: SUCCESS_GREEN,
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
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
              const allocation = roomAllocations[match._id];

              return (
                <div
                  key={match._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: CARD_BG,
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    border: "1px solid #F1F2F6",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        backgroundColor: ORANGE,
                        color: "white",
                        fontWeight: "700",
                        fontSize: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        userSelect: "none",
                      }}
                    >
                      {getInitials(other.firstName, other.lastName)}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          color: TEXT_PRIMARY,
                          fontSize: "16px",
                        }}
                      >
                        {other.firstName} {other.lastName}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: TEXT_SECONDARY,
                        }}
                      >
                        {other.email}
                      </div>

                      {/* Allocated room info */}
                      {allocation?.selectedRoomId ? (
                        <p
                          style={{
                            marginTop: 6,
                            color: ORANGE,
                            fontWeight: "600",
                            fontSize: "14px",
                          }}
                        >
                          Allocated Room:{" "}
                          {allocation.selectedRoomId.roomNumber} (
                          {allocation.selectedRoomId.type})
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={() => navigate(`/moodboard/${match._id}`)}
                      style={{
                        backgroundColor: SUCCESS_GREEN,
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Go to Moodboard
                    </button>

                    {allocation?.selectedRoomId || hasAllocatedRoom ? (
                      <button
                        disabled
                        style={{
                          backgroundColor: "#BDC3C7",
                          color: "#666",
                          border: "none",
                          borderRadius: "6px",
                          padding: "10px 20px",
                          fontWeight: "600",
                          cursor: "not-allowed",
                          fontSize: "14px",
                        }}
                        title={
                          allocation?.selectedRoomId
                            ? "Room already allocated"
                            : "Cannot allocate - room already assigned"
                        }
                      >
                        Allocate Room
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/room-allocation/${match._id}`)}
                        style={{
                          backgroundColor: ORANGE,
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "10px 20px",
                          fontWeight: "600",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Allocate Room
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Top Roommate Matches */}
        <div
          style={{
            backgroundColor: CARD_BG,
            borderRadius: "12px",
            padding: "32px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h2
              style={{
                color: TEXT_PRIMARY,
                fontSize: "20px",
                fontWeight: "600",
                margin: 0,
              }}
            >
              Top Roommate Matches
            </h2>
            <button
              onClick={() => navigate("/survey")}
              style={{
                backgroundColor: "transparent",
                color: ORANGE,
                border: `2px solid ${ORANGE}`,
                borderRadius: "8px",
                padding: "10px 20px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Take Survey
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              justifyItems: matches.length === 0 ? "center" : "stretch",
            }}
          >
            {matches.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: TEXT_SECONDARY,
                  fontSize: "16px",
                }}
              >
                No matches yet, please update your survey.
              </div>
            ) : (
              matches.map((match) => {
                const targetUserId =
                  match.userId || match._id || (match.user && match.user._id);
                if (!targetUserId || String(targetUserId) === String(user._id))
                  return null;

                const matchedConnection = getMatchedConnection(targetUserId);
                const sent = pendingRequests.includes(targetUserId);
                const isRejected = rejectedUserIds.has(String(targetUserId));
                const currentUserMaxedOut = finalMatches.length >= 2;

                // Disable connect if allocated room exists for user or final matches
                const disableConnect =
                  !!matchedConnection ||
                  sent ||
                  isRejected ||
                  currentUserMaxedOut ||
                  hasAllocatedRoom;

                const firstName =
                  match.firstName || (match.user && match.user.firstName) || "";
                const lastName =
                  match.lastName || (match.user && match.user.lastName) || "";

                return (
                  <div
                    key={targetUserId}
                    style={{
                      backgroundColor: "#FAFBFC",
                      padding: "24px",
                      borderRadius: "12px",
                      border: "1px solid #F1F2F6",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        backgroundColor: ORANGE,
                        color: "white",
                        fontSize: "24px",
                        fontWeight: "700",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: "16px",
                        userSelect: "none",
                      }}
                    >
                      {getInitials(firstName, lastName)}
                    </div>

                    <h3
                      style={{
                        margin: "0 0 8px 0",
                        color: TEXT_PRIMARY,
                        fontSize: "18px",
                        fontWeight: "600",
                      }}
                    >
                      {firstName} {lastName}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 16px 0",
                        fontWeight: "700",
                        color: ORANGE,
                        fontSize: "16px",
                      }}
                    >
                      Score: {match.compatibilityScore}%
                    </p>

                    {match.compatibilityReasons && (
                      <div
                        style={{
                          textAlign: "left",
                          marginBottom: "20px",
                          width: "100%",
                          color: TEXT_SECONDARY,
                          fontSize: "13px",
                        }}
                      >
                        {match.compatibilityReasons
                          .slice(0, 3)
                          .map((reason, i) => (
                            <div
                              key={i}
                              style={{
                                marginBottom: "6px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "8px",
                              }}
                            >
                              <span
                                style={{
                                  color: SUCCESS_GREEN,
                                  fontWeight: "bold",
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
                          backgroundColor: SUCCESS_GREEN,
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          padding: "12px 24px",
                          cursor: "pointer",
                          fontWeight: "600",
                          width: "100%",
                          fontSize: "14px",
                        }}
                      >
                        Go to Moodboard
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          !disableConnect && handleSendRequest(targetUserId)
                        }
                        disabled={disableConnect}
                        style={{
                          backgroundColor: disableConnect ? "#BDC3C7" : ORANGE,
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          padding: "12px 24px",
                          cursor: disableConnect ? "not-allowed" : "pointer",
                          fontWeight: "600",
                          width: "100%",
                          fontSize: "14px",
                          transition: "all 0.2s ease",
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
                              : "You have been allocated a room"
                            : "Send connection request"
                        }
                      >
                        {sent
                          ? "Request Sent"
                          : disableConnect
                          ? "Unavailable"
                          : "Connect"}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
