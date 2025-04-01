import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Matches.css";
import axios from "axios"; 


const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const loggedInEmail =
    localStorage.getItem("rememberedUser") || sessionStorage.getItem("loggedInUser");

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
    onClick={() =>
      navigate("/chat", {
        state: { selectedUserEmail: currentMatch.email },
      })
    }
  >
    Start Chat
  </button>
  <button className="profile-btn">View Profile</button>
  <button className="like-btn" onClick={handleLike}>
    ❤️ Like
  </button> {/* NEW Like  */}
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
