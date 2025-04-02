import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css"; // Ensure this file exists

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");

  useEffect(() => {
    const darkModeStored = localStorage.getItem("darkMode") === "true";
  
    if (darkModeStored) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, []);
  
  
  
  useEffect(() => {
    const storedUser = localStorage.getItem("rememberedUser") || sessionStorage.getItem("loggedInUser");
    if (!storedUser) {
      navigate("/"); // Redirect to login if user isn't stored
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  // ✅ Logout Function (Clears Login Data & Redirects)
  const handleLogout = () => {
    localStorage.removeItem("rememberedUser"); // Remove persistent login
    sessionStorage.removeItem("loggedInUser"); // Remove session-based login
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="home-container">
      {/* ✅ Logout Button (Now in Top-Right Corner) */}
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      {/* ✅ Welcome Text (Now Positioned at the Top) */}
      <div className="welcome-text">
        <h1>Welcome, {user}!</h1>
        <p>Start finding your perfect match today.</p>
      </div>
    </div>
  );
};

export default Home;
