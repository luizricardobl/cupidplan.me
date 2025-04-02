import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import "../styles/Chat.css";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true,
});

const Chat = () => {
  const location = useLocation();
  const selectedUserEmail = location.state?.selectedUserEmail;
  const currentUserEmail =
      localStorage.getItem("rememberedUser") || sessionStorage.getItem("loggedInUser");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [dateIdea, setDateIdea] = useState("");

  const roomId = [currentUserEmail, selectedUserEmail].sort().join("_");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!currentUserEmail || !selectedUserEmail) return;

    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/chat/history/${currentUserEmail}/${selectedUserEmail}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setMessages(data.messages);
        } else {
          console.error("❌ Failed to load chat history");
        }
      } catch (err) {
        console.error("❌ Error fetching chat history:", err);
      }
    };

    fetchChatHistory();
    socket.emit("joinRoom", roomId);

    const handleReceiveMessage = (data) => {
      const isChatMatch =
          (data.sender === currentUserEmail && data.receiver === selectedUserEmail) ||
          (data.sender === selectedUserEmail && data.receiver === currentUserEmail);

      if (!isChatMatch) return;

      setMessages((prev) => {
        const isDuplicate = prev.some(
            (msg) =>
                msg.sender === data.sender &&
                msg.message === data.message &&
                Math.abs(new Date(msg.timestamp) - new Date(data.timestamp)) < 1000
        );
        return isDuplicate ? prev : [...prev, data];
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);

    socket.on("partnerTyping", ({ sender, room }) => {
      if (room === roomId && sender !== currentUserEmail) {
        setPartnerTyping(true);
        clearTimeout(window.partnerTypingTimeout);
        window.partnerTypingTimeout = setTimeout(() => {
          setPartnerTyping(false);
        }, 500);
      }
    });

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageDeleted");
      socket.emit("leaveRoom", roomId);
    };
  }, [roomId, currentUserEmail, selectedUserEmail]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const messageData = {
        room: roomId,
        sender: currentUserEmail,
        receiver: selectedUserEmail,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessage("");
      socket.emit("sendMessage", messageData);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/delete/${messageId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        socket.emit("deleteMessage", { messageId, room: roomId });
        setSelectedMessageId(null);
      } else {
        console.error("❌ Failed to delete message");
      }
    } catch (err) {
      console.error("❌ Error deleting message:", err);
    }
  };

  const fetchUserData = async (userEmail) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/data/${userEmail}`);
      const data = await response.json();
      if (response.ok && data.success) {
        return {
          activities: data.activities,
          foodPreferences: data.foodPreferences,
          location: data.location,
        };
      } else {
        console.error('Failed to fetch user data:', data.error);
        return { activities: [], foodPreferences: [], location: '' };
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return { activities: [], foodPreferences: [], location: '' };
    }
  };

  const handleSuggestDate = async () => {
    try {
      const currentUserData = await fetchUserData(currentUserEmail);
      const selectedUserData = await fetchUserData(selectedUserEmail);

      const combinedActivities = [...new Set([...currentUserData.activities, ...selectedUserData.activities])];
      const combinedFoodPreferences = [...new Set([...currentUserData.foodPreferences, ...selectedUserData.foodPreferences])];
      const combinedLocation = currentUserData.location || selectedUserData.location;

      const response = await fetch('http://localhost:5000/api/ai/generate-date-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activities: combinedActivities, food: combinedFoodPreferences, location: combinedLocation }),
      });
      const data = await response.json();
      if (data.success) {
        const dateIdeaMessage = {
          className: 'date-idea',
          room: roomId,
          sender: currentUserEmail,
          receiver: selectedUserEmail,
          message: `Here is a date suggestion: ${data.dateIdea}`,
          timestamp: new Date().toISOString(),
        };

        // Add date idea to local state
        setMessages((prev) => [...prev, dateIdeaMessage]);

        // Send date idea to server
        socket.emit("sendMessage", dateIdeaMessage);
      } else {
        console.error('Failed to generate date idea:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
      <>
        <div className="chat-container">
          <h2>💬 Chat with {selectedUserEmail}</h2>
          <div className="chat-box">
            {messages.map((msg, idx) => {
              const isOwnMessage = msg.sender === currentUserEmail;
              const formattedTime = msg.timestamp
                  ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : "";
              const messageId = msg._id || `${msg.timestamp}_${idx}`;
              const isSelected = selectedMessageId === messageId;

              return (
                  <div
                      key={messageId}
                      className={`chat-bubble ${isOwnMessage ? "own" : "other"} ${msg.className || ""}`}
                      onClick={() =>
                          isOwnMessage && msg._id
                              ? setSelectedMessageId(isSelected ? null : messageId)
                              : null
                      }
                      style={{ cursor: isOwnMessage && msg._id ? "pointer" : "default" }}
                  >
                    <div>
                      <strong>{isOwnMessage ? "You" : msg.sender.split("@")[0]}:</strong>{" "}
                      {msg.message || msg.text}
                    </div>
                    <div className="timestamp">{formattedTime}</div>

                    {isOwnMessage && isSelected && msg._id && (
                        <button
                            className="delete-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMessage(msg._id);
                            }}
                        >
                          🗑️ Delete
                        </button>
                    )}
                  </div>
              );
            })}

            {partnerTyping && (
                <div
                    style={{
                      color: "gray",
                      fontStyle: "italic",
                      margin: "4px 0 4px 10px",
                      clear: "both",
                    }}
                >
                  Typing...
                </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSend} className="chat-form">
          <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                socket.emit("typing", {
                  room: roomId,
                  sender: currentUserEmail,
                });
              }}
          />
          <button type="submit">Send</button>
        </form>
        <button onClick={handleSuggestDate}>Suggest Date</button>
      </>
  );
};

export default Chat;