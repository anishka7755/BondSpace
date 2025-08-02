import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api"; // axios instance with baseURL and auth header set
import RoomAllocationChat from "../components/RoomAllocationChat";
import io from "socket.io-client";

const ORANGE = "#FF6B35";
const BG = "#F8F9FA";
const CARD_BG = "#FFFFFF";
const TEXT_PRIMARY = "#2C3E50";
const TEXT_SECONDARY = "#7F8C8D";
const SUCCESS_GREEN = "#27AE60";
const ERROR_RED = "#E74C3C";
const LIGHT_GREEN_BG = "#E8F5E8";
const LIGHT_RED_BG = "#FADBD8";
const SOCKET_SERVER_URL = "http://localhost:5000";
const socket = io(SOCKET_SERVER_URL);

export default function RoomAllocationPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [allocation, setAllocation] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Get current user from localStorage or auth context
  const authUser = JSON.parse(localStorage.getItem("auth_user"));
  const currentUserId = authUser?.id || authUser?._id || null;
  const currentUserName = authUser
    ? `${authUser.firstName} ${authUser.lastName}`
    : "";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const allocationRes = await api.get(`/room-allocations/${matchId}`);
        setAllocation(allocationRes.data);

        const roomsRes = await api.get(`/rooms`);
        setRooms(roomsRes.data || []);

        if (allocationRes.data.selectedRoomId) {
          setSelectedRoomId(allocationRes.data.selectedRoomId._id);
        }
      } catch (err) {
        setError(
          err.response?.data.message ||
            "Failed to load allocation or rooms data"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [matchId]);

  useEffect(() => {
    // Make sure socket is defined and connected here or is accessible via ref
    if (!socket) return;

    const handleRoomSelected = ({ roomId }) => {
      setSelectedRoomId(roomId);
      setAllocation((prev) => ({
        ...prev,
        selectedRoomId:
          rooms.find((r) => r._id === roomId) || prev.selectedRoomId,
      }));
    };

    socket.on("roomSelected", handleRoomSelected);

    return () => {
      socket.off("roomSelected", handleRoomSelected);
    };
  }, [rooms, socket]);

  const isAllocator =
    String(allocation?.allocatorUserId?._id) === String(currentUserId);
  console.log("allocatorId:", allocation?.allocatorUserId?._id);

  const handleRoomSelect = (roomId) => {
    if (!isAllocator || allocation?.isConfirmed) return;
    setSelectedRoomId(roomId);
    socket.emit("roomSelected", { matchId, roomId });
  };

  const handleSubmit = async () => {
    if (!selectedRoomId) {
      alert("Please select a room before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/room-allocations/${matchId}/select-room`, {
        roomId: selectedRoomId,
      });
      alert("Room successfully allocated!");
      const allocationRes = await api.get(`/room-allocations/${matchId}`);
      setAllocation(allocationRes.data);
    } catch (err) {
      setError(err.response?.data.message || "Failed to allocate room");
    } finally {
      setSubmitting(false);
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
        Loading room allocation...
      </div>
    );

  if (error)
    return (
      <div style={{ minHeight: "100vh", background: BG, padding: "40px" }}>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: LIGHT_RED_BG,
            padding: "32px",
            borderRadius: "12px",
            border: `1px solid ${ERROR_RED}`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: ERROR_RED,
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            {error}
          </div>
        </div>
      </div>
    );

  if (!allocation)
    return (
      <div style={{ minHeight: "100vh", background: BG, padding: "40px" }}>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: LIGHT_RED_BG,
            padding: "32px",
            borderRadius: "12px",
            border: `1px solid ${ERROR_RED}`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: ERROR_RED,
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            Room allocation data not found.
          </div>
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
            Room Allocation
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              backgroundColor: TEXT_SECONDARY,
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div
        style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 40px 60px" }}
      >
        {/* Allocator Info Card */}
        <div
          style={{
            backgroundColor: CARD_BG,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            padding: "24px",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: TEXT_PRIMARY,
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "12px",
            }}
          >
            Match Allocation Details
          </h2>
          <p
            style={{
              color: TEXT_SECONDARY,
              fontSize: "16px",
              marginBottom: "8px",
            }}
          >
            Allocator:{" "}
            <span style={{ color: ORANGE, fontWeight: "600" }}>
              {allocation.allocatorUserId?.firstName}{" "}
              {allocation.allocatorUserId?.lastName}
            </span>
          </p>
          <p
            style={{
              color: TEXT_SECONDARY,
              fontSize: "14px",
            }}
          >
            {isAllocator
              ? "You are responsible for selecting the room for this match."
              : "Waiting for the allocator to select a room."}
          </p>
        </div>

        {allocation.isConfirmed ? (
          /* Confirmed Allocation */
          <div
            style={{
              backgroundColor: LIGHT_GREEN_BG,
              borderRadius: "12px",
              padding: "32px",
              marginBottom: "30px",
              border: `1px solid ${SUCCESS_GREEN}`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                backgroundColor: SUCCESS_GREEN,
                color: "white",
                borderRadius: "50%",
                width: "60px",
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: "24px",
              }}
            >
              ✓
            </div>
            <h3
              style={{
                color: SUCCESS_GREEN,
                fontSize: "24px",
                fontWeight: "700",
                marginBottom: "16px",
              }}
            >
              Room Successfully Allocated!
            </h3>
            <div
              style={{
                backgroundColor: CARD_BG,
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "24px",
                border: `1px solid #D5EDDA`,
              }}
            >
              <h4
                style={{
                  color: TEXT_PRIMARY,
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Room {allocation.selectedRoomId?.roomNumber}
              </h4>
              <p
                style={{
                  color: TEXT_SECONDARY,
                  fontSize: "14px",
                  marginBottom: "4px",
                }}
              >
                Type: {allocation.selectedRoomId?.type}
              </p>
              <p
                style={{
                  color: TEXT_SECONDARY,
                  fontSize: "14px",
                }}
              >
                Floor: {allocation.selectedRoomId?.floor || "N/A"} • Window:{" "}
                {allocation.selectedRoomId?.window ? "Yes" : "No"}
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                backgroundColor: SUCCESS_GREEN,
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "14px 32px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          /* Room Selection */
          <>
            <div
              style={{
                backgroundColor: CARD_BG,
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                padding: "32px",
                marginBottom: "30px",
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
                  Available Rooms
                </h2>
                <div
                  style={{
                    fontSize: "14px",
                    color: TEXT_SECONDARY,
                    backgroundColor: "#F8F9FA",
                    padding: "8px 16px",
                    borderRadius: "20px",
                  }}
                >
                  {
                    rooms.filter(
                      (room) =>
                        !room.isOccupied &&
                        (room.occupants?.length ?? 0) <
                          (room.type === "Twin" ? 2 : 1)
                    ).length
                  }{" "}
                  rooms available
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "20px",
                  maxHeight: "400px",
                  overflowY: "auto",
                  paddingRight: "8px",
                }}
              >
                {rooms.length === 0 ? (
                  <div
                    style={{
                      gridColumn: "1/-1",
                      textAlign: "center",
                      color: TEXT_SECONDARY,
                      fontSize: "16px",
                      padding: "40px",
                    }}
                  >
                    No rooms available.
                  </div>
                ) : (
                  rooms.map((room) => {
                    const isFull =
                      room.isOccupied ||
                      (room.occupants?.length ?? 0) >=
                        (room.type === "Twin" ? 2 : 1);
                    const isSelected = selectedRoomId === room._id;
                    const canSelect =
                      !isFull && isAllocator && !allocation.isConfirmed;

                    return (
                      <div
                        key={room._id}
                        onClick={() => canSelect && handleRoomSelect(room._id)}
                        style={{
                          backgroundColor: isFull
                            ? LIGHT_RED_BG
                            : isSelected
                              ? "#FFF4E6"
                              : CARD_BG,
                          border: isSelected
                            ? `2px solid ${ORANGE}`
                            : isFull
                              ? `1px solid ${ERROR_RED}`
                              : "1px solid #E9ECEF",
                          borderRadius: "12px",
                          padding: "20px",
                          cursor: canSelect ? "pointer" : "not-allowed",
                          opacity: isFull ? 0.7 : 1,
                          transition: "all 0.3s ease",
                          position: "relative",
                        }}
                      >
                        {isSelected && (
                          <div
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              backgroundColor: ORANGE,
                              color: "white",
                              borderRadius: "50%",
                              width: "24px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              fontWeight: "700",
                            }}
                          >
                            ✓
                          </div>
                        )}

                        <h3
                          style={{
                            color: isSelected
                              ? ORANGE
                              : isFull
                                ? ERROR_RED
                                : TEXT_PRIMARY,
                            fontSize: "18px",
                            fontWeight: "600",
                            marginBottom: "12px",
                          }}
                        >
                          Room {room.roomNumber}
                        </h3>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            marginBottom: "16px",
                          }}
                        >
                          <span
                            style={{
                              backgroundColor: isSelected
                                ? ORANGE
                                : isFull
                                  ? ERROR_RED
                                  : TEXT_SECONDARY,
                              color: "white",
                              padding: "4px 12px",
                              borderRadius: "16px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {room.type}
                          </span>
                          <span
                            style={{
                              backgroundColor: "#F8F9FA",
                              color: TEXT_SECONDARY,
                              padding: "4px 12px",
                              borderRadius: "16px",
                              fontSize: "12px",
                            }}
                          >
                            Floor {room.floor || "N/A"}
                          </span>
                          {room.window && (
                            <span
                              style={{
                                backgroundColor: "#E8F5E8",
                                color: SUCCESS_GREEN,
                                padding: "4px 12px",
                                borderRadius: "16px",
                                fontSize: "12px",
                              }}
                            >
                              Window View
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              color: TEXT_SECONDARY,
                              fontSize: "14px",
                            }}
                          >
                            Occupancy: {room.occupants?.length ?? 0}/
                            {room.type === "Twin" ? 2 : 1}
                          </span>
                          {isFull && (
                            <span
                              style={{
                                color: ERROR_RED,
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                            >
                              FULL
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {isAllocator && !allocation.isConfirmed && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "32px",
                    paddingTop: "24px",
                    borderTop: "1px solid #E9ECEF",
                  }}
                >
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedRoomId || submitting}
                    style={{
                      backgroundColor:
                        selectedRoomId && !submitting ? ORANGE : "#BDC3C7",
                      color: "white",
                      border: "none",
                      padding: "16px 40px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "16px",
                      cursor:
                        selectedRoomId && !submitting
                          ? "pointer"
                          : "not-allowed",
                      transition: "all 0.2s ease",
                      minWidth: "200px",
                    }}
                  >
                    {submitting ? "Confirming..." : "Confirm Room Selection"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Chat Component */}
        <div
          style={{
            backgroundColor: CARD_BG,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            padding: "24px",
          }}
        >
          <h3
            style={{
              color: TEXT_PRIMARY,
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px",
              paddingBottom: "16px",
              borderBottom: "1px solid #E9ECEF",
            }}
          >
            Discussion
          </h3>
          <RoomAllocationChat
            matchId={matchId}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        </div>
      </div>
    </div>
  );
}
