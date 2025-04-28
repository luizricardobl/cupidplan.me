import React, { useEffect, useState } from "react";
import "../styles/Discover.css";
import { useNavigate } from "react-router-dom";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://cupidplan-me.onrender.com"; 

const ConfirmedMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loggedInEmail =
    localStorage.getItem("rememberedUser") || sessionStorage.getItem("loggedInUser");

  useEffect(() => {
    const fetchConfirmedMatches = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/matches/confirmed/${loggedInEmail}`);

        const data = await res.json();
        if (data.success) {
          setMatches(data.matches);
        }
      } catch (err) {
        console.error("Error loading confirmed matches:", err);
      } finally {
        setLoading(false);
      }
    };

    if (loggedInEmail) {
      fetchConfirmedMatches();
    }
  }, [loggedInEmail]);

  return (
    <div className="matches-container">
      <h1>Your Matches 💞</h1>
      {loading ? (
        <p>Loading matches...</p>
      ) : matches.length === 0 ? (
        <p>No matches yet. Keep swiping!</p>
      ) : (
        <div className="match-list">
          {matches.map((match, index) => (
            <div key={index} className="match-card">
              <img
                src={match.profilePicUrl || "/images/default-profile.jpg"}
                alt={match.name}
                className="match-img"
              />
              <h2>{match.name}</h2>
              <p>{match.aboutMe || "No bio available."}</p>
              <button onClick={() => navigate(`/chat/${match.email}`)}>💬 Chat</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConfirmedMatches;
