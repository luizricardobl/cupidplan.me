import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/Chat.css";
import { useParams } from "react-router-dom";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useLocation } from "react-router-dom";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://cupidplan-me.onrender.com"; 

const getDateLabel = (dateString) => {
 
};

const Chat = () => {
  const { email: selectedUserEmail } = useParams();
  const currentUserEmail = localStorage.getItem("rememberedUser") || sessionStorage.getItem("loggedInUser");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [receiverData, setReceiverData] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [receiverLastSeen, setReceiverLastSeen] = useState(null);
  const [lastSeenByReceiver, setLastSeenByReceiver] = useState(false);
  const [socket, setSocket] = useState(null);
  const [activeDateIdea, setActiveDateIdea] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const notificationSound = new Audio("/sounds/mixkit-correct-answer-tone-2870.wav");
  const location = useLocation();


  
  


  const roomId = [currentUserEmail, selectedUserEmail].sort().join("_");

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(BASE_URL, {
      transports: ["websocket"],
      withCredentials: true,
      query: { email: currentUserEmail },
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUserEmail]);

  // Fetch user data with memoization
  const fetchUserData = useCallback(async (email) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user/by-email/${email}`);

      return res.data.success ? res.data.data : null;
    } catch (err) {
      console.error(`❌ Failed to fetch user data for ${email}:`, err);
      return null;
    }
  }, []);

  // Combined function to fetch both users' data
  const fetchBothUsersData = useCallback(async () => {
    const [currentData, receiverData] = await Promise.all([
      fetchUserData(currentUserEmail),
      fetchUserData(selectedUserEmail)
    ]);
    return { currentData, receiverData };
  }, [currentUserEmail, selectedUserEmail, fetchUserData]);

  // Handle sending messages
  const handleSend = useCallback((e) => {
    e.preventDefault();
    if (message.trim() && socket) {
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
  }, [message, roomId, currentUserEmail, selectedUserEmail, socket]);

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  
  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji.native);
  };
  

  // Handle deleting messages
  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/chat/delete/${messageId}`, {

        method: "DELETE",
      });
      if (res.ok && socket) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        socket.emit("deleteMessage", { messageId, room: roomId });
        setSelectedMessageId(null);
      }
    } catch (err) {
      console.error("❌ Error deleting message:", err);
    }
  }, [roomId, socket]);

  // Generate date idea handler
  const handleGenerateDateIdea = useCallback(async () => {
    try {
      const { currentData, receiverData } = await fetchBothUsersData();
      if (!currentData || !receiverData) return;

      const combinedPreferences = {
        hobbies: [...new Set([...(currentData.hobbies || []), ...(receiverData.hobbies || [])])],
        favoriteFood: [...new Set([...(currentData.favoriteFood || []), ...(receiverData.favoriteFood || [])])],
        location: currentData.location || receiverData.location || "your city",
        relationshipStage: currentData.relationshipStage || "dating",
        budget: currentData.budget || "moderate",
        dateFrequency: currentData.dateFrequency || "weekly",
        specialOccasion: currentData.specialOccasion || null,
      };

      const response = await axios.post(`${BASE_URL}/api/dates/generate`, {

        preferences: combinedPreferences,
        userEmail: currentUserEmail,
        partnerName: receiverData.name || "your partner",
        currentDate: new Date().toLocaleDateString()
      });

      if (response.status === 200 && socket) {
        const messageData = {
          room: roomId,
          sender: currentUserEmail,
          receiver: selectedUserEmail,
          message: "✨ Your custom date idea has been generated! 📅 Tap below to check it out. Then Head to Dates To view.",
          timestamp: new Date().toISOString(),
          isDateSuggestion: true,
          fullDateIdea: response.data.dateIdea 
        };
        
        setMessages((prev) => [...prev, messageData]);
        setActiveDateIdea(response.data.dateIdea); 
        socket.emit("sendMessage", messageData);
        
        const formattedDateIdea = `✨ **Custom Date Idea for You Two** ✨\n\n${response.data.dateIdea}\n\nHope you love this! 💖`;

        await axios.post(`${BASE_URL}/api/shared-dates/create`, {

          senderEmail: currentUserEmail,
          receiverEmail: selectedUserEmail,
          message: formattedDateIdea,
        });
        
        
      }
    } catch (error) {
      if (socket) {
        const fallbackMessage = {
          room: roomId,
          sender: currentUserEmail,
          receiver: selectedUserEmail,
          message: "Having trouble generating date ideas right now, but how about a cozy dinner and movie night? 🍿",
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, fallbackMessage]);
        socket.emit("sendMessage", fallbackMessage);
      }
    }
  }, [fetchBothUsersData, roomId, currentUserEmail, selectedUserEmail, socket]);

  // Main effect for chat initialization
  useEffect(() => {
    if (!currentUserEmail || !selectedUserEmail || !socket) return;

    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/chat-history/history/${currentUserEmail}/${selectedUserEmail}`);


        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setMessages(data.messages);
          
            // Look for the most recent date suggestion and restore its content
            const lastDateMsg = [...data.messages].reverse().find((msg) => msg.isDateSuggestion && msg.fullDateIdea);
            if (lastDateMsg && lastDateMsg.fullDateIdea) {
              setActiveDateIdea(lastDateMsg.fullDateIdea);
            }
          }
          
        }
      } catch (err) {
        console.error("❌ Error fetching chat history:", err);
      }
    };

    const fetchLastSeen = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/user/last-seen/${selectedUserEmail}`);

        if (res.data.success) {
          const date = new Date(res.data.lastSeen);
          setReceiverLastSeen(date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }
      } catch (err) {
        console.error("❌ Failed to fetch last seen:", err);
      }
    };

    const handleReceiveMessage = (data) => {
      const isChatMatch = 
        (data.sender === currentUserEmail && data.receiver === selectedUserEmail) ||
        (data.sender === selectedUserEmail && data.receiver === currentUserEmail);
      if (!isChatMatch) return;

      setMessages((prev) => {
        const isDuplicate = prev.some(msg => 
          msg.sender === data.sender &&
          msg.message === data.message &&
          Math.abs(new Date(msg.timestamp) - new Date(data.timestamp)) < 1000
        );
        return isDuplicate ? prev : [...prev, data];
      });
      
      const isOnChatPage = location.pathname.includes("/chat");

      if (data.sender !== currentUserEmail && !isOnChatPage) {
        notificationSound.play().catch((err) => {
          console.warn("🔇 Sound blocked:", err);
        });
      }
      



      if (data.isDateSuggestion && data.fullDateIdea) {
        setActiveDateIdea(data.fullDateIdea); 
      }
      
    };

    fetchChatHistory();
    fetchBothUsersData().then(({ receiverData }) => {
      if (receiverData) {
        setReceiverData(receiverData);
      }
    });
    fetchLastSeen();
    socket.emit("joinRoom", roomId);
    socket.emit("userOnline", currentUserEmail);

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageSeen", ({ viewer, sender, room: seenRoom }) => {
      if (seenRoom === roomId && sender === currentUserEmail && viewer === selectedUserEmail) {
        setLastSeenByReceiver(true);
      }
    });
    socket.on("partnerTyping", ({ sender, room }) => {
      if (room === roomId && sender !== currentUserEmail) {
        setPartnerTyping(true);
        clearTimeout(window.partnerTypingTimeout);
        window.partnerTypingTimeout = setTimeout(() => setPartnerTyping(false), 500);
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
  }, [roomId, currentUserEmail, selectedUserEmail, fetchBothUsersData, socket]);

  // Online status effect
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = async (onlineMap) => {
      const online = !!onlineMap[selectedUserEmail];
      setIsOnline(online);
      if (!online) {
        try {
          const res = await axios.get(`http://localhost:5000/api/user/last-seen/${selectedUserEmail}`);
          if (res.data.success) {
            const date = new Date(res.data.lastSeen);
            setReceiverLastSeen(date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          }
        } catch (err) {
          console.error("❌ Failed to fetch real-time last seen:", err);
        }
      }
    };

    socket.on("updateOnlineStatus", handleStatusUpdate);
    return () => {
      socket.off("updateOnlineStatus", handleStatusUpdate);
    };
  }, [selectedUserEmail, socket]);

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="chat-container">
        <div className="chat-header">
          <img
            src={receiverData?.profilePicUrl || "/images/default-profile.jpg"}
            alt={receiverData?.name || "User"}
            className="chat-profile-pic"
          />
          <div className="chat-header-info">
          <h2>
  {receiverData?.name
    ? receiverData.name
    : receiverData === null
    ? "Loading..."
    : selectedUserEmail}
</h2>

            
            <p className={`online-status ${isOnline ? "online" : "offline"}`}>
              {isOnline ? "Online" : receiverLastSeen ? `Last seen at ${receiverLastSeen}` : "Offline"}
            </p>
          </div>
        </div>

        <div className="chat-box">
          {messages.map((msg, idx) => {
            const isOwnMessage = msg.sender === currentUserEmail;
            const formattedTime = msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "";
            const messageId = msg._id || `${msg.timestamp}_${idx}`;
            const isSelected = selectedMessageId === messageId;
            const showDateSeparator = idx === 0 || new Date(msg.timestamp).toDateString() !==
              new Date(messages[idx - 1]?.timestamp).toDateString();

            return (
              <React.Fragment key={messageId}>
                {showDateSeparator && getDateLabel(msg.timestamp) && (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div className="date-separator">🕒 {getDateLabel(msg.timestamp)}</div>
                  </div>
                )}

                <div
                  className={`chat-bubble ${isOwnMessage ? "own" : "other"} ${
                    msg.message.includes("✨ **Custom Date Idea") ? "date-suggestion" : ""
                  }`}
                  data-is-date-suggestion={msg.isDateSuggestion}
                  onClick={() => isOwnMessage && msg._id && setSelectedMessageId(isSelected ? null : messageId)}
                  style={{ cursor: isOwnMessage && msg._id ? "pointer" : "default" }}
                >
                  {msg.isDateSuggestion ? (
  <>
    <div>{msg.message}</div>
    <button
      className="view-date-button"
      onClick={() => {
        setActiveDateIdea(msg.fullDateIdea || msg.message);
        setShowDateModal(true);
      }}
    >
      View Date Plan
    </button>
  </>
) : (
  <div>{msg.message}</div>
)}

                  <div className="timestamp">{formattedTime}</div>

                  {isOwnMessage && idx === messages.length - 1 && lastSeenByReceiver && (
                    <div className="seen-indicator">👀 Seen</div>
                  )}

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
              </React.Fragment>
            );
          })}

          {partnerTyping && (
            <div style={{ color: "gray", fontStyle: "italic", margin: "4px 0 4px 10px", clear: "both" }}>
              Typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <button
  onClick={handleGenerateDateIdea}
  className="heart-generate-button"
>
  <span>❤️</span>
  <span>Generate<br />Date</span>
</button>

<form onSubmit={handleSend} className="chat-form">
  <div className="chat-input-wrapper">
    <button
      type="button"
      className="emoji-toggle-btn"
      onClick={toggleEmojiPicker}
    >
      😊
    </button>

    {showEmojiPicker && (
  <div className="emoji-picker-container">
    <Picker data={data} onEmojiSelect={addEmoji} />
  </div>
)}


    <input
      type="text"
      placeholder="Type your message..."
      value={message}
      onChange={(e) => {
        setMessage(e.target.value);
        socket && socket.emit("typing", { room: roomId, sender: currentUserEmail });
      }}
    />

    <button type="submit">Send</button>
  </div>
</form>



      {showDateModal && (
  <div className="date-modal-overlay">
    <div className="date-modal">
      <h3>💖 Custom Date Plan</h3>
      <p style={{ whiteSpace: "pre-wrap" }}>{activeDateIdea}</p>
      <button onClick={() => setShowDateModal(false)} className="close-modal-button">
        Close
      </button>
    </div>
  </div>
)}

    </>
  );
};

export default Chat;