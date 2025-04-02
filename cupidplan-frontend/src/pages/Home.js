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
  <button className="logout-btn" onClick={handleLogout}>Logout</button>

  {/* ✅ Welcome */}
  <div className="welcome-text">
    <h1>Welcome, {user}!</h1>
    <p>Start finding your perfect match today.</p>
    <button className="find-match-btn">Find Your Match</button>
  </div>

  {/* ✅ Cards Grid */}
  <div className="card-grid">
    {/* Upcoming Dates */}
    <div className="home-card">
      <h3>📅 Upcoming Dates</h3>
      <p><strong>Coffee with Alex</strong></p>
      <p>Tomorrow, 2:00 PM</p>
      <p className="subtle">Starbucks, Downtown</p>
    </div>

    {/* AI-Suggested Dates */}
    <div className="home-card">
      <h3>🤖 AI-Suggested Dates</h3>
      <p><strong>Wine Tasting Experience</strong></p>
      <p className="desc">Based on your interest in culinary adventures</p>
      <p><strong>Sunset Beach Picnic</strong></p>
      <p className="desc">Matches your preference for outdoor activities</p>
    </div>

    {/* Recent Activity */}
    <div className="home-card">
      <h3>🔔 Recent Activity</h3>
      <p><strong>Michael</strong> liked your profile</p>
      <p className="timestamp">2 hours ago</p>
      <p><strong>Emma</strong> sent you a message</p>
      <p className="timestamp">5 hours ago</p>
    </div>
  </div>

  {/* ✅ Featured Date Ideas */}
  <h2 className="featured-header">Featured Date Ideas</h2>
  <div className="featured-grid">
      {[
        {
          title: "Cooking Class",
          desc: "Learn to cook together",
          img: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
        },
        {
          title: "Wine Tasting",
          desc: "Discover new flavors",
          img: "https://images.unsplash.com/photo-1606788075761-2b361a5f74e0",
        },
        {
          title: "Hiking Adventure",
          desc: "Explore nature together",
          img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
        },
        {
          title: "Art Gallery Tour",
          desc: "Cultural experience",
          img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
        },
      ].map((idea, i) => (
        <div className="idea-card" key={i}>
          <img src={idea.img} alt={idea.title} />
          <h4>{idea.title}</h4>
          <p className="desc">{idea.desc}</p>
        </div>
      ))}
      
  </div>

  {/* ✅ Footer */}
  <footer className="footer">
    © 2025 CupidPlan.me. All rights reserved.
  </footer>
</div>

  );
};

export default Home;
