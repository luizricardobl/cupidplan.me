// Discover.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Discover.css"; // Make sure this path is correct
import axios from "axios";
import { io } from "socket.io-client";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHeart, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

const socket = io(`${API_BASE_URL}`, {
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
    const [lightboxOpen, setLightboxOpen] = useState(false);
const [selectedPhoto, setSelectedPhoto] = useState(null);


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
                const res = await fetch(`${API_BASE_URL}/api/matches/discover/${loggedInEmail}`);
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
            socket.on("userInfoUpdated", (updatedUser) => {
                setMatches((prevMatches) =>
                  prevMatches.map((match) =>
                    match.email === updatedUser.email
                      ? { ...match, name: updatedUser.name, location: updatedUser.location }
                      : match
                  )
                );
              });
              
            console.log(`🔄 Visibility update: ${email} is now ${hidden ? "hidden" : "visible"}`);
            if (!hidden) fetchMatches(); // Refresh if profile is now visible again
            else setMatches((prev) => prev.filter((match) => match.email !== email));
        });

        return () => {
            socket.off("profileVisibilityChanged");
            socket.off("userInfoUpdated");
          };
          
    }, [loggedInEmail]);

    const currentProfile = matches[currentIndex];

    const handleSwipe = async (direction) => {
        if (!currentProfile) return;

        const route =
            direction === "right"
                ? `${API_BASE_URL}/api/swipes/like`
                : `${API_BASE_URL}/api/swipes/pass`;

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
                <motion.div
                    className="match-card"
                    key={currentProfile.email}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.4 }}
                >
                    <img
                        src={currentProfile.profilePicUrl || "/images/default-profile.jpg"}
                        alt="Profile"
                        className="match-img"
                    />
                    <div className="match-info">
                        <h2>{currentProfile.name}</h2>
                        <p className="about-me-text">{currentProfile.aboutMe || "No bio available."}</p>
                        <p className="location-text">
  {currentProfile.location
    ? (() => {
        const cleanParts = currentProfile.location
          .split(",")
          .map(part => part.trim())
          .filter(part =>
            !/^\d{5}(-\d{4})?$/.test(part) && // Exclude ZIPs
            !/^\d+/.test(part)                // Exclude parts starting with numbers (street address)
          );
        return cleanParts.length ? cleanParts.join(", ") : "Location not provided";
      })()
    : "Location not provided"}
</p>

         
                        <p className="match-percent">{currentProfile.matchPercentage}% Similar</p>
                        <div className="match-buttons">
                            <button className="pass-btn" onClick={() => handleSwipe("left")}>
                                <FontAwesomeIcon icon={faTimes} /> Pass
                            </button>
                            <button className="view-profile-btn" onClick={handleViewProfile}>
                                <FontAwesomeIcon icon={faInfoCircle} /> View Profile
                            </button>
                            <button className="like-btn" onClick={() => handleSwipe("right")}>
                                <FontAwesomeIcon icon={faHeart} /> Like
                            </button>
                        </div>
                    </div>
                </motion.div>
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
                                <FontAwesomeIcon icon={faTimes} />
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
                                <div className="about-me-card">
                                    <p>{selectedUser.aboutMe || "Not available."}</p>
                                </div>
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
                            {selectedUser.album && selectedUser.album.length > 0 && (
  <div className="profile-section">
    <h3>📸 Photo Album</h3>
    <div className="album-preview-grid">
      {selectedUser.album.map((url, idx) => (
        <img
          key={idx}
          src={url}
          alt={`Photo ${idx + 1}`}
          className="public-album-photo"
          onClick={() => {
            setSelectedPhoto(url);
            setLightboxOpen(true);
          }}
        />
      ))}
      

    </div>
  </div>
)}

                        </div>
                    </div>
                </div>
            )}
            {lightboxOpen && selectedPhoto && (
  <div className="lightbox-backdrop" onClick={() => setLightboxOpen(false)}>
    <img src={selectedPhoto} alt="Enlarged" className="lightbox-img" />
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
                            <button className="chat-btn" onClick={() => {
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