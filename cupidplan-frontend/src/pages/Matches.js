import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Matches.css";
import axios from "axios"; 
import { io } from "socket.io-client";


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
const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
const [showModal, setShowModal] = useState(false);

const handleViewProfile = () => {
  setSelectedUser(currentMatch);
  setShowModal(true);
};

const handleCloseModal = () => {
  setShowModal(false);
  setSelectedUser(null);
};


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
        const res = await fetch(`http://localhost:5000/api/matches/${loggedInEmail}`);
        const data = await res.json();

        if (data.success) {
          setMatches(data.matches);
        } else {
          console.error("Failed to fetch matches");
        }
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };

    if (loggedInEmail) {
      fetchMatches();
    }
    socket.on("profileVisibilityChanged", ({ email, hidden }) => {
      console.log(`🔄 Match visibility update received for ${email}: ${hidden ? "HIDDEN" : "VISIBLE"}`);
    
      setMatches((prevMatches) => {
        if (hidden) {
          // Remove the hidden profile
          return prevMatches.filter((match) => match.email !== email);
        } else {
          // Re-fetch to add them back if they should now be shown
          fetchMatches(); // Make sure this function is defined
          return prevMatches;
        }
      });
    });
    
    return () => {
      socket.off("profileVisibilityChanged");
    };
  }, [loggedInEmail]);

  const nextMatch = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevMatch = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentMatch = matches[currentIndex];

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/likes",
        { receiverId: currentMatch._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("You liked this user!");
    } catch (err) {
      console.error("Error liking user:", err);
      alert("Failed to like user. You might've already liked them.");
    }
  };
  

  return (
    <div className="matches-container">
      <h1>CupidPlan.me</h1>

      {loading ? (
        <p>Loading matches...</p>
      ) : currentMatch ? (
        <div className="match-card">
          <img
            src="/images/default-profile.jpg"
            alt="Profile"
            className="match-img"
          />
          <div className="match-info">
            <h2>{currentMatch.name}</h2>
            <p>{currentMatch.aboutMe || "No bio available."}</p>
            <p>{currentMatch.location || "Location not provided"}</p>
            <p className="match-percent">{currentMatch.matchPercentage}% Match</p>
            <div className="match-buttons">
  <button
    onClick={() => navigate(`/chat/${currentMatch.email}`)}
  >
    Start Chat
  </button>
  <button className="profile-btn" onClick={handleViewProfile}>
  View Profile
</button>

  <button className="like-btn" onClick={handleLike}>
    ❤️ Like
  </button>
  {showModal && selectedUser && (
  <div className="profile-modal-backdrop">
    <div className="profile-modal-card">
      <div
        className="profile-modal-hero"
        style={{
          backgroundImage: `url(${selectedUser.profilePicUrl || "/images/default-profile.jpg"})`,
        }}
      >
        <button className="close-btn" onClick={handleCloseModal}>✖</button>
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

</div>


          </div>
        </div>
      ) : (
        <p>No matches found.</p>
      )}

      {matches.length > 1 && (
        <div className="pagination">
          <button onClick={prevMatch} disabled={currentIndex === 0}>
            ⬅ Prev
          </button>
          <span>
            {currentIndex + 1} / {matches.length}
          </span>
          <button onClick={nextMatch} disabled={currentIndex === matches.length - 1}>
            Next ➡
          </button>
        </div>
      )}
    </div>
  );
};

export default Matches;
