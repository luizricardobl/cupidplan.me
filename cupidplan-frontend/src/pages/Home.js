import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import "../styles/Home.css"; 

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", name: "" });


  useEffect(() => {
    const darkModeStored = localStorage.getItem("darkMode") === "true";
  
    if (darkModeStored) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, []);
  
  
  
  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedUser") || sessionStorage.getItem("loggedInUser");
    const token = localStorage.getItem("token");
  
    if (!storedEmail || !token) {
      navigate("/");
      return;
    }
  
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({ email: storedEmail, name: res.data.name });
      } catch (err) {
        console.error("❌ Failed to fetch user profile:", err);
      }
    };
  
    fetchUserProfile();
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

  {/* ✅ Welcome Text + Button */}
  <div className="welcome-text">
    <h1>Welcome, {user.name || user.email}!</h1>
    <p>Start finding your perfect match today.</p>
    <button className="find-match-btn" onClick={() => navigate("/discover")}>
      Find Your Match
    </button>
  </div>

  <div className="video-wrapper">
  <div className="video-responsive">
    <video
      controls
      autoPlay
      muted
      loop
      playsInline
      className="local-video"
    >
      <source src="/videos/cupidplan_intro.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
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
