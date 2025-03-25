import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import "../styles/Chat.css";

const socket = io("http://localhost:5000");

const Chat = () => {
  const location = useLocation();
  const selectedUserEmail = location.state?.selectedUserEmail;
  const currentUserEmail =
    localStorage.getItem("rememberedUser") || sessionStorage.getItem("loggedInUser");

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [partnerTyping, setPartnerTyping] = useState(false);
    

  const roomId = [currentUserEmail, selectedUserEmail].sort().join("_");

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  useEffect(() => {
    if (!currentUserEmail || !selectedUserEmail) return;
  
    // ✅ Step 1: Fetch chat history first
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
  
    // ✅ Step 2: Join room after loading history
    socket.emit("joinRoom", roomId);
  
    // ✅ Step 3: Handle receiving new messages
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
  
    // ✅ Step 4: Handle typing indicator
    socket.on("partnerTyping", ({ sender, room }) => {
      if (room === roomId && sender !== currentUserEmail) {
        setPartnerTyping(true);
        clearTimeout(window.partnerTypingTimeout);
        window.partnerTypingTimeout = setTimeout(() => {
          setPartnerTyping(false);
        }, 500);
      }
    });
  
    // ✅ Step 5: 
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
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
        timestamp: new Date().toISOString()
      };
      
      // message to local state
      setMessages((prev) => [...prev, messageData]);
      setMessage("");
      
      // Send to server
      socket.emit("sendMessage", messageData);
    }
  };

  return (
    <><div className="chat-container">
          <h2>💬 Chat with {selectedUserEmail}</h2>
          <div className="chat-box">
              {messages.map((msg, idx) => {
                  const isOwnMessage = msg.sender === currentUserEmail;
                  const formattedTime = msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : "";

                  return (
                      <div
                          key={`${msg.timestamp}_${idx}`}
                          className={`chat-bubble ${isOwnMessage ? "own" : "other"}`}
                      >
                          <div>
                              <strong>{isOwnMessage ? "You" : msg.sender.split("@")[0]}:</strong> {msg.message}
                          </div>
                          <div className="timestamp">{formattedTime}</div>
                      </div>
                  );
              })}
              {/* ✅ Typing indicator here */}
              {partnerTyping && (
                  <div
                      style={{
                          color: "gray",
                          fontStyle: "italic",
                          margin: "4px 0 4px 10px",
                          clear: "both"
                      }}
                  >
                      Typing...
                  </div>
              )}
          </div>

          <div ref={messagesEndRef} />
      </div><form onSubmit={handleSend} className="chat-form">
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
                  } } />
              <button type="submit">Send</button>
          </form></>

  );
};

export default Chat;