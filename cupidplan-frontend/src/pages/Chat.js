import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/Chat.css";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true,
});

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
  const [isOnline, setIsOnline] = useState(false);


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
    const handleStatusUpdate = (onlineMap) => {
      setIsOnline(!!onlineMap[selectedUserEmail]);
    };
  
    socket.on("updateOnlineStatus", handleStatusUpdate);
  
    return () => {
      socket.off("updateOnlineStatus", handleStatusUpdate);
    };
  }, [selectedUserEmail]);
  
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
      {isOnline ? "Online" : "Offline"}
    </p>
  </div>
</div>

      <h2>💬 Chat with {selectedUserName || selectedUserEmail}</h2>
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
                className={`chat-bubble ${isOwnMessage ? "own" : "other"}`}
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
    </>
  );
};

export default Chat;
