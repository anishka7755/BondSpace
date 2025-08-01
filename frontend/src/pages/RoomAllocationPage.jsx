import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api"; // axios instance with baseURL and auth header set
import RoomAllocationChat from "../components/RoomAllocationChat";
import io from "socket.io-client";

const ORANGE = "#ff7300";
const BG = "#fff6ef";
const SOFT_GRAY = "#f5f5f5";
const ERROR_RED = "#d9534f";
const SUCCESS_GREEN = "#28a745";
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
  const currentUserName = authUser ? `${authUser.firstName} ${authUser.lastName}` : "";


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
        setError(err.response?.data.message || "Failed to load allocation or rooms data");
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
        selectedRoomId: rooms.find((r) => r._id === roomId) || prev.selectedRoomId,
      }));
    };

    socket.on("roomSelected", handleRoomSelected);

    return () => {
      socket.off("roomSelected", handleRoomSelected);
    };
  }, [rooms, socket]);


  const isAllocator =
  String(allocation?.allocatorUserId?._id) === String(currentUserId);
  console.log('allocatorId:', allocation?.allocatorUserId?._id);
  



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
      <div style={{ padding: 24, fontWeight: "bold", color: ORANGE, textAlign: "center" }}>
        Loading room allocation...
      </div>
    );

  if (error)
    return (
      <div
        style={{
          padding: 24,
          fontWeight: "bold",
          color: ERROR_RED,
          textAlign: "center",
          backgroundColor: "#fcebea",
          borderRadius: 8,
          maxWidth: 600,
          margin: "40px auto",
          boxShadow: "0 0 10px rgba(255, 0, 0, 0.1)",
        }}
      >
        {error}
      </div>
    );

  if (!allocation)
    return (
      <div
        style={{
          padding: 24,
          fontWeight: "bold",
          color: ERROR_RED,
          textAlign: "center",
          maxWidth: 600,
          margin: "40px auto",
        }}
      >
        Room allocation data not found.
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: BG,
        maxWidth: 720,
        margin: "32px auto",
        padding: 24,
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(255, 115, 0, 0.12)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          color: ORANGE,
          marginBottom: 16,
          fontWeight: "700",
          fontSize: "1.9rem",
          textAlign: "center",
          letterSpacing: 1.2,
          userSelect: "none",
        }}
      >
        Room Allocation for Match
      </h1>

      <p
        style={{
          textAlign: "center",
          fontWeight: 600,
          fontSize: "1.1rem",
          marginBottom: 24,
          color: "#333",
        }}
      >
        Allocator:{" "}
        <span style={{ color: ORANGE, fontWeight: "700" }}>
          {allocation.allocatorUserId?.firstName} {allocation.allocatorUserId?.lastName}
        </span>
      </p>

      {allocation.isConfirmed ? (
        <section
          style={{
            padding: 20,
            backgroundColor: "#e6f4e6",
            borderRadius: 12,
            marginBottom: 30,
            borderLeft: `6px solid ${SUCCESS_GREEN}`,
            boxShadow: "0 1px 8px rgba(40, 167, 69, 0.2)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "1.1rem", marginBottom: 8 }}>
            <strong>
              Room Allocated:{" "}
              <span style={{ color: ORANGE }}>
                {allocation.selectedRoomId?.roomNumber} ({allocation.selectedRoomId?.type})
              </span>
            </strong>
          </p>
          <p style={{ fontWeight: 600, color: SUCCESS_GREEN }}>Room allocation is confirmed.</p>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              marginTop: 24,
              cursor: "pointer",
              padding: "12px 32px",
              backgroundColor: ORANGE,
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: "700",
              fontSize: "1rem",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e66800")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
          >
            Back to Dashboard
          </button>
        </section>
      ) : (
        <>
          <p
            style={{
              marginBottom: 24,
              fontSize: "1rem",
              color: "#444",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {isAllocator
              ? "You are the allocator. Please select a room for you and your roommate."
              : "Waiting for the allocator to select a room."}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
              marginBottom: 28,
              maxHeight: 300,
              overflowY: "auto",
              paddingRight: 6,
            }}
          >
            {rooms.length === 0 ? (
              <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#999" }}>
                No rooms available.
              </p>
            ) : (
              rooms.map((room) => {
                const isFull =
                  room.isOccupied ||
                  (room.occupants?.length ?? 0) >= (room.type === "Twin" ? 2 : 1);
                const isSelected = selectedRoomId === room._id;

                return (
                  <div
                    key={room._id}
                    onClick={() =>
                      !isFull && isAllocator && !allocation.isConfirmed && handleRoomSelect(room._id)
                    }
                    tabIndex={isFull || !isAllocator || allocation.isConfirmed ? -1 : 0}
                    role="button"
                    aria-pressed={isSelected}
                    style={{
                      borderRadius: 12,
                      boxShadow: isSelected
                        ? `0 0 12px 4px ${ORANGE}`
                        : "0 1px 6px rgba(0, 0, 0, 0.1)",
                      backgroundColor: isFull ? "#ffe6e6" : "white",
                      cursor:
                        isFull || !isAllocator || allocation.isConfirmed ? "not-allowed" : "pointer",
                      opacity: isFull ? 0.6 : 1,
                      userSelect: "none",
                      padding: 18,
                      color: "#333",
                      transition: "box-shadow 0.3s ease, background-color 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !isFull &&
                        isAllocator &&
                        !allocation.isConfirmed
                      ) {
                        handleRoomSelect(room._id);
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (!isFull && isAllocator && !allocation.isConfirmed) {
                        e.currentTarget.style.boxShadow = `0 0 15px 5px ${ORANGE}`;
                        e.currentTarget.style.backgroundColor = "#fff8f0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.1)";
                        e.currentTarget.style.backgroundColor = isFull ? "#ffe6e6" : "white";
                      }
                    }}
                  >
                    <label
                      htmlFor={`room-${room._id}`}
                      style={{
                        cursor:
                          isFull || !isAllocator || allocation.isConfirmed
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: isSelected ? 700 : 600,
                        fontSize: "1.15rem",
                        marginBottom: 8,
                        color: isSelected ? ORANGE : "#222",
                      }}
                    >
                      Room {room.roomNumber} - {room.type}
                    </label>
                    <small style={{ marginBottom: 6, color: "#555" }}>
                      Floor: {room.floor || "N/A"} | Window: {room.window ? "Yes" : "No"}
                    </small>
                    <small style={{ color: "#666" }}>
                      Occupants: {room.occupants?.length ?? 0} / {room.type === "Twin" ? 2 : 1}
                    </small>
                    <input
                      type="radio"
                      id={`room-${room._id}`}
                      name="room"
                      checked={isSelected}
                      readOnly
                      style={{ display: "none" }}
                    />
                  </div>
                );
              })
            )}
          </div>

          {isAllocator && !allocation.isConfirmed && (
            <button
              onClick={handleSubmit}
              disabled={!selectedRoomId || submitting}
              style={{
                width: "fit-content",
                margin: "0 auto",
                backgroundColor: selectedRoomId && !submitting ? ORANGE : "#f0a654cc",
                color: "white",
                border: "none",
                padding: "12px 36px",
                borderRadius: 8,
                fontWeight: "700",
                fontSize: "1.1rem",
                cursor: selectedRoomId && !submitting ? "pointer" : "not-allowed",
                transition: "background-color 0.3s ease",
                userSelect: "none",
                boxShadow: selectedRoomId && !submitting ? `0 0 12px ${ORANGE}` : "none",
              }}
              onMouseEnter={(e) => {
                if (selectedRoomId && !submitting) e.currentTarget.style.backgroundColor = "#e66800";
              }}
              onMouseLeave={(e) => {
                if (selectedRoomId && !submitting) e.currentTarget.style.backgroundColor = ORANGE;
              }}
            >
              {submitting ? "Submitting..." : "Confirm Room Selection"}
            </button>
          )}
        </>
      )}

      {/* Chat Component */}
      <div
        style={{
          marginTop: 36,
          borderTop: `1px solid ${SOFT_GRAY}`,
          paddingTop: 20,
          flexGrow: 1,
        }}
      >
        <RoomAllocationChat 
          matchId={matchId} 
          currentUserId={currentUserId} 
          currentUserName={currentUserName} 
        />
      </div>
    </div>
  );
}
