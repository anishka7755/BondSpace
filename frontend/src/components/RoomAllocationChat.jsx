import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const ORANGE = "#ff7300";
const THEIRS_BG = "#8346d6";
const RECEIVER_COLOR = "#fff";
const SENDER_COLOR = "#fff";
const SOCKET_SERVER_URL = "http://localhost:5000";

// Key for sessionStorage
const SESSION_STORAGE_KEY = "roomAllocationChatMessages";

export default function RoomAllocationChat({ matchId }) {
  const [messages, setMessages] = useState(() => {
    // Try loading initial messages from sessionStorage
    try {
      const storedMessages = sessionStorage.getItem(`${SESSION_STORAGE_KEY}_${matchId}`);
      return storedMessages ? JSON.parse(storedMessages) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const socketRef = useRef();
  const messagesEndRef = useRef();

  // Retrieve current user info from localStorage
  const authUser = JSON.parse(localStorage.getItem("auth_user"));
  const currentUserId = authUser?._id || authUser?.id || null;
  const currentUserName = authUser ? `${authUser.firstName} ${authUser.lastName}` : "";

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.emit("joinRoom", matchId);
    socketRef.current.on("receiveMessage", (message) => {
      setMessages((prev) => {
        const updated = [...prev, message];
        // Save updated messages to sessionStorage
        try {
          sessionStorage.setItem(`${SESSION_STORAGE_KEY}_${matchId}`, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    });
    return () => socketRef.current.disconnect();
  }, [matchId]);

  // Save messages to sessionStorage whenever messages state changes (including local sends)
  useEffect(() => {
    try {
      sessionStorage.setItem(`${SESSION_STORAGE_KEY}_${matchId}`, JSON.stringify(messages));
    } catch {}
  }, [messages, matchId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !currentUserId) return;
    const messageData = {
      matchId,
      message: input,
      senderUserId: currentUserId,
      senderName: currentUserName,
    };
    socketRef.current.emit("sendMessage", messageData);

    const newMessage = { ...messageData, _id: Date.now().toString(), createdAt: new Date() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ...rest of your rendering and styling remains the same...

  return (
    <div
      style={{
        border: `2px solid ${ORANGE}`,
        borderRadius: 8,
        padding: 12,
        height: 400,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fffaf0",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <style>{`
        .rmx-bubble-mine {
          background: ${ORANGE} !important;
          color: ${SENDER_COLOR} !important;
          border-radius: 20px 4px 20px 20px !important;
          box-shadow: 0 3px 8px rgba(255, 115, 0, 0.20);
        }
        .rmx-bubble-theirs {
          background: ${THEIRS_BG} !important;
          color: ${RECEIVER_COLOR} !important;
          border-radius: 4px 20px 20px 20px !important;
          box-shadow: 0 3px 8px rgba(131, 70, 214, 0.28);
        }
      `}</style>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: 12,
          paddingRight: 8,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#777", textAlign: "center" }}>
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((msg) => {
          const isMine = String(msg.senderUserId) === String(currentUserId);
          return (
            <div
              key={msg._id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMine ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}
            >
              {!isMine && msg.senderName && (
                <div
                  style={{
                    fontSize: 12,
                    color: THEIRS_BG,
                    marginBottom: 4,
                    fontWeight: "600",
                    userSelect: "none",
                  }}
                >
                  {msg.senderName}
                </div>
              )}
              <div
                className={isMine ? "rmx-bubble-mine" : "rmx-bubble-theirs"}
                style={{
                  maxWidth: "70%",
                  padding: "10px 18px",
                  textAlign: "left",
                  wordBreak: "break-word",
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                {msg.message}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#999",
                  marginTop: 4,
                  width: "70%",
                  textAlign: isMine ? "right" : "left",
                  userSelect: "none",
                }}
              >
                {msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <textarea
        rows={2}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message here"
        style={{
          padding: 10,
          fontSize: 14,
          borderRadius: 8,
          border: `1px solid ${ORANGE}`,
          resize: "none",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "inherit",
          outline: "none",
        }}
      />
      <button
        onClick={sendMessage}
        disabled={!input.trim() || !currentUserId}
        style={{
          marginTop: 8,
          padding: "10px 26px",
          backgroundColor: !input.trim() || !currentUserId ? "#f0a654cc" : ORANGE,
          color: "white",
          border: "none",
          borderRadius: 6,
          fontWeight: "600",
          cursor: !input.trim() || !currentUserId ? "not-allowed" : "pointer",
          alignSelf: "flex-end",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => {
          if (input.trim() && currentUserId) e.currentTarget.style.backgroundColor = "#e66800";
        }}
        onMouseLeave={(e) => {
          if (input.trim() && currentUserId) e.currentTarget.style.backgroundColor = ORANGE;
        }}
      >
        Send
      </button>
    </div>
  );
}
