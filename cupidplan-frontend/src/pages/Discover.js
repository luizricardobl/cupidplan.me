// Discover.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Discover.css"; // Rename your CSS file
import axios from "axios";
import { io } from "socket.io-client";
import confetti from "canvas-confetti";

const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true,
});
const matchSound = new Audio("/sounds/match.mp3");

const Discover = () => {
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null); // 🆕 new state
const [showMatchModal, setShowMatchModal] = useState(false);


  const navigate = useNavigate();
  const loggedInEmail =
    localStorage.getItem("rememberedUser") || sessionStorage.getItem("loggedInUser");

  useEffect(() => {
    const darkModeStored = localStorage.getItem("darkMode") === "true";
    if (darkModeStored) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/matches/discover/${loggedInEmail}`);
        const data = await res.json();
        if (data.success) {
          setMatches(data.matches);
        } else {
          console.error("Failed to fetch discoverable profiles");
        }
      } catch (err) {
        console.error("Error fetching profiles:", err);
      } finally {
        setLoading(false);
      }
    };

    if (loggedInEmail) {
      fetchMatches();
    }

    socket.on("profileVisibilityChanged", ({ email, hidden }) => {
      console.log(`🔄 Visibility update: ${email} is now ${hidden ? "hidden" : "visible"}`);
      if (!hidden) fetchMatches(); // Refresh if profile is now visible again
      else setMatches((prev) => prev.filter((match) => match.email !== email));
    });

    return () => socket.off("profileVisibilityChanged");
  }, [loggedInEmail]);

  const currentProfile = matches[currentIndex];

  const handleSwipe = async (direction) => {
    if (!currentProfile) return;
  
    const route =
      direction === "right"
        ? "http://localhost:5000/api/swipes/like"
        : "http://localhost:5000/api/swipes/pass";
  
    try {
      const res = await axios.post(route, {
        swiperEmail: loggedInEmail,
        swipeeEmail: currentProfile.email,
      });
  
      // ✅ Show Match Popup if both users liked each other
      if (direction === "right" && res.data.matched) {
        setMatchedUser(currentProfile);
        setShowMatchModal(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
        });
        matchSound.play();

      }
      
  
      // Move to next profile after short delay (optional UX smoothness)
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 500);
    } catch (err) {
      console.error("Swipe failed:", err);
    }
  };
  

  const handleViewProfile = () => {
    setSelectedUser(currentProfile);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  return (
    <div className="matches-container">
      <h1>CupidPlan.Me - Discover</h1>

      {loading ? (
        <p>Loading profiles...</p>
      ) : currentProfile ? (
        <div className="match-card">
          <img
            src={currentProfile.profilePicUrl || "/images/default-profile.jpg"}
            alt="Profile"
            className="match-img"
          />
          <div className="match-info">
            <h2>{currentProfile.name}</h2>
            <p>{currentProfile.aboutMe || "No bio available."}</p>
            <p>{currentProfile.location || "Location not provided"}</p>
            <p className="match-percent">{currentProfile.matchPercentage}% Match</p>
            <div className="match-buttons">
              <button onClick={() => handleSwipe("left")}>❌ Pass</button>
              <button onClick={handleViewProfile}>View Profile</button>
              <button onClick={() => handleSwipe("right")}>❤️ Like</button>
            </div>
          </div>
        </div>
      ) : (
        <p>No more profiles to show.</p>
      )}

      {showModal && selectedUser && (
        <div className="profile-modal-backdrop">
          <div className="profile-modal-card">
            <div
              className="profile-modal-hero"
              style={{
                backgroundImage: `url(${selectedUser.profilePicUrl || "/images/default-profile.jpg"})`,
              }}
            >
              <button className="close-btn" onClick={handleCloseModal}>
                ✖
              </button>
              <div className="overlay-info">
                <h2>{selectedUser.name}</h2>
                <p className="age-line">
                  Age: {selectedUser.dob ? calculateAge(selectedUser.dob) : "Not provided"}
                </p>
              </div>
            </div>

            <div className="profile-modal-content profile-modal">
              <div className="profile-section about-me-section">
                <h3>About Me</h3>
                <p>{selectedUser.aboutMe || "Not available."}</p>
              </div>
              <div className="profile-section">
                <h3>Interests</h3>
                <div className="tag-container">
                  {selectedUser.hobbies?.length > 0
                    ? selectedUser.hobbies.map((hobby, i) => (
                        <span key={i} className="tag">
                          {hobby}
                        </span>
                      ))
                    : <p className="tag-placeholder">None listed</p>}
                </div>
              </div>
              <div className="profile-section">
                <h3>Dealbreakers</h3>
                <div className="tag-container">
                  {selectedUser.dealbreakers?.length > 0
                    ? selectedUser.dealbreakers.map((d, i) => (
                        <span key={i} className="tag tag-red">
                          {d}
                        </span>
                      ))
                    : <p className="tag-placeholder">None listed</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showMatchModal && matchedUser && (
  <div className="match-popup-backdrop">
    <div className="match-popup">
      <h2>💘 It's a Match!</h2>
      <p>You and <strong>{matchedUser.name}</strong> liked each other.</p>
      <img
        src={matchedUser.profilePicUrl || "/images/default-profile.jpg"}
        alt="Matched"
        className="match-img-popup"
      />
      <div className="match-buttons">
  <button onClick={() => setShowMatchModal(false)}>Close</button>
  <button onClick={() => {
    setShowMatchModal(false);
    navigate(`/chat/${matchedUser.email}`);
  }}>
    💬 Start Chat
  </button>
</div>

    </div>
  </div>
)}

    </div>
  );
};

export default Discover;
