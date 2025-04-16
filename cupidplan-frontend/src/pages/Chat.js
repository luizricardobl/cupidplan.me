import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/Chat.css";
import { useParams } from "react-router-dom";

const currentUserEmail =
  localStorage.getItem("rememberedUser") || sessionStorage.getItem("loggedInUser");

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true,
  query: {
    email: currentUserEmail,
  },
});

const getDateLabel = (dateString) => {
  const messageDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(messageDate, today)) return null;
  if (isSameDay(messageDate, yesterday))
    return `Yesterday • ${messageDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;

  return `${messageDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })} • ${messageDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;
};



const Chat = () => {
  
  const { email: selectedUserEmail } = useParams();

  const currentUserEmail =
    localStorage.getItem("rememberedUser") || sessionStorage.getItem("loggedInUser");

  const [message, setMessage] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [receiverData, setReceiverData] = useState(null);
  const [currentUserPreferences, setCurrentUserPreferences] = useState(null);
  const [receiverPreferences, setReceiverPreferences] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [receiverLastSeen, setReceiverLastSeen] = useState(null);
  const [lastSeenByReceiver, setLastSeenByReceiver] = useState(false);




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
    socket.emit("userOnline", currentUserEmail);
    
    const fetchLastSeen = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/user/last-seen/${selectedUserEmail}`);
        if (res.data.success) {
          const date = new Date(res.data.lastSeen);
          setReceiverLastSeen(date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          }));
        }
      } catch (err) {
        console.error("❌ Failed to fetch last seen:", err);
      }
    };

    const fetchReceiverData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/user/by-email/${selectedUserEmail}`);
        if (res.data) {
          setReceiverData(res.data);
          setSelectedUserName(res.data.name); 
        }
      } catch (err) {
        console.error("❌ Failed to fetch selected user data:", err);
      }
    };
    
    
    fetchReceiverData(); 
    fetchLastSeen();

    

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

    socket.on("messageSeen", ({ viewer, sender, room: seenRoom }) => {
      if (
        seenRoom === roomId &&
        sender === currentUserEmail &&
        viewer === selectedUserEmail
      ) {
        setLastSeenByReceiver(true);
      }
    });
    

    socket.on("partnerTyping", ({ sender, room }) => {
      if (room === roomId && sender !== currentUserEmail) {
        setPartnerTyping(true);
        clearTimeout(window.partnerTypingTimeout);
        window.partnerTypingTimeout = setTimeout(() => {
          setPartnerTyping(false);
        }, 500);
      }
    });

    // ✅ Listen for real-time message deletions
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
        socket.emit("deleteMessage", { messageId, room: roomId }); // ✅ Real-time emit
        setSelectedMessageId(null);
      } else {
        console.error("❌ Failed to delete message");
      }
    } catch (err) {
      console.error("❌ Error deleting message:", err);
    }
  };
  const { email } = useParams();
  
  useEffect(() => {
    console.log("🟢 Chatting with:", email);
  
    // Load messages with this email 
  }, [email]);
  
  useEffect(() => {
    const handleUnload = () => {
      socket.disconnect();
    };
  
    window.addEventListener("beforeunload", handleUnload);
  
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);
  
  useEffect(() => {
    const handleStatusUpdate = async (onlineMap) => {
      const online = !!onlineMap[selectedUserEmail];
      setIsOnline(online);
  
      if (!online) {
        try {
          const res = await axios.get(`http://localhost:5000/api/user/last-seen/${selectedUserEmail}`);
          if (res.data.success) {
            const date = new Date(res.data.lastSeen);
            setReceiverLastSeen(date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            }));
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
  }, [selectedUserEmail]);

  const fetchCurrentUserPreferences = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/by-email/${currentUserEmail}`);
      if (res.data.success) {
        const { hobbies, favoriteFood, location } = res.data.data;
        setCurrentUserPreferences({ hobbies, favoriteFood, location });
      } else {
        console.error("❌ Failed to fetch current user preferences:", res.data.message);
      }
    } catch (err) {
      console.error("❌ Error fetching current user preferences:", err);
    }
  };

  const fetchReceiverData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/by-email/${selectedUserEmail}`);
      if (res.data.success) {
        setReceiverData(res.data.data); // Store full user data
        setSelectedUserName(res.data.data.name);

        // Extract and store preferences
        const { hobbies, favoriteFood, location } = res.data.data;
        setReceiverPreferences({ hobbies, favoriteFood, location });
      } else {
        console.error("❌ Failed to fetch receiver details:", res.data.message);
      }
    } catch (err) {
      console.error("❌ Failed to fetch selected user data:", err);
    }
  };

  const combineUserPreferences = () => {
    if (!currentUserPreferences || !receiverPreferences) {
      console.error("❌ Preferences are not fully loaded yet.");
      return;
    }

    const combinedPreferences = {
      hobbies: [
        ...(currentUserPreferences.hobbies || []),
        ...(receiverPreferences.hobbies || []),
      ],
      favoriteFood: [
        ...(currentUserPreferences.favoriteFood || []),
        ...(receiverPreferences.favoriteFood || []),
      ],
      location: [
        ...(currentUserPreferences.location ? [currentUserPreferences.location] : []),
        ...(receiverPreferences.location ? [receiverPreferences.location] : []),
      ],
    };

    return combinedPreferences;
  };

  return (
    <>
      <div className="chat-container">
      <div className="chat-header">
  <img
    src={receiverData?.profilePicUrl || "/images/default-profile.jpg"}
    alt={receiverData?.name}
    className="chat-profile-pic"
  />
  <div className="chat-header-info">
    <h2>{receiverData?.name || selectedUserEmail}</h2>
    <p className={`online-status ${isOnline ? "online" : "offline"}`}>
  {isOnline
    ? "Online"
    : receiverLastSeen
    ? `Last seen at ${receiverLastSeen}`
    : "Offline"}
</p>

  </div>
</div>

    
        <div className="chat-box">
        {messages.map((msg, idx) => {
  const isOwnMessage = msg.sender === currentUserEmail;
  const formattedTime = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const messageId = msg._id || `${msg.timestamp}_${idx}`;
  const isSelected = selectedMessageId === messageId;

  const showDateSeparator =
    idx === 0 ||
    new Date(msg.timestamp).toDateString() !==
      new Date(messages[idx - 1]?.timestamp).toDateString();

  const dateLabel = getDateLabel(msg.timestamp);

  return (
    <React.Fragment key={messageId}>
      {showDateSeparator && dateLabel && (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <div className="date-separator">🕒 {dateLabel}</div>
  </div>
)}


      <div
        className={`chat-bubble ${isOwnMessage ? "own" : "other"}`}
        onClick={() =>
          isOwnMessage && msg._id
            ? setSelectedMessageId(isSelected ? null : messageId)
            : null
        }
        style={{
          cursor: isOwnMessage && msg._id ? "pointer" : "default",
        }}
      >
        <div>{msg.message || msg.text}</div>
        <div className="timestamp">{formattedTime}</div>

        {isOwnMessage &&
          idx === messages.length - 1 &&
          lastSeenByReceiver && <div className="seen-indicator">👀 Seen</div>}

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
<button
  onClick={async () => {
    await fetchCurrentUserPreferences();
    await fetchReceiverData();
    const combinedPreferences = combineUserPreferences();
    if (!combinedPreferences) {
      console.error("❌ Unable to combine preferences.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/dates/generate", {
        preferences: combinedPreferences,
      });

      if (response.status === 200) {
        const dateIdea = response.data.dateIdea;

        // Emit the generated idea as a message
        const messageData = {
          room: roomId,
          sender: currentUserEmail,
          receiver: selectedUserEmail,
          message: dateIdea,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, messageData]);
        socket.emit("sendMessage", messageData);
      } else {
        console.error("❌ Failed to generate date idea:", response.data.message);
      }
    } catch (error) {
      console.error("❌ Error calling /generate route:", error.message);
    }
  }}
  className="generate-date-button"
>
  Generate Date Idea
</button>
    </>
  );
};

export default Chat;
