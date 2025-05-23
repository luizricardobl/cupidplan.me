import React, { useState } from "react";
import "../styles/profile.css";
import profilePic from "../assets/default-profile.jpg";
import logo from "../assets/cupid-plan-logo-2.png";
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import cupidPlan from "../assets/cupid-plan.png";

const BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://cupidplan-me.onrender.com";

  const socket = io(BASE_URL, {
    transports: ["websocket"],
    withCredentials: true,
  });  

const Profile = () => {
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [likesThisWeek, setLikesThisWeek] = useState(0);
  const [prefsChanged, setPrefsChanged] = useState(false);
  const [recentMatches, setRecentMatches] = useState([]);
  const [unreadSenders, setUnreadSenders] = useState([]);
  const [bioSaved, setBioSaved] = useState(false);
  const navigate = useNavigate();
  const [toggles, setToggles] = useState({
    showProfile: false,
    aiRecommendations: false,
    darkMode: false,
  });

  const [profile, setProfile] = useState({
    name: "",
    location: "",
    age: 28,
    aboutMe: "",
    profilePicUrl: "",
    interests: [],
    dealbreakers:[],
    minAge: 18,
    maxAge: 100,
    distance: 50,
    types: {
      casual: false,
      romantic: false,
      adventurous: false,
    },
  });
  

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

  useEffect(() => {
    const darkModeStored = localStorage.getItem("darkMode") === "true";
    
    if (darkModeStored) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  
    setToggles((prev) => ({ ...prev, darkMode: darkModeStored }));
  }, []);
  
  const fetchUnreadNotifications = async () => {
    const token = localStorage.getItem("token");
  
    try {
      const res = await axios.get(`${BASE_URL}/api/chat-history/unread`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (res.data.showNotification) {
        setUnreadSenders(res.data.senders);
      } else {
        setUnreadSenders([]); // hide if none
      }
    } catch (err) {
      console.error("❌ Failed to fetch unread messages:", err);
    }
  };
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token being used:", token);
  
        const response = await axios.get(`${BASE_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
  
        const data = response.data;
  
        setProfile((prev) => ({
          ...prev,
          name: data.name || prev.name,
          location: data.location || prev.location,
          age: data.dob ? calculateAge(data.dob) : prev.age,
          aboutMe: data.aboutMe || prev.aboutMe,
          profileImage: data.profileImage || "", 
          profilePicUrl: data.profilePicUrl || "", 
          interests: data.hobbies || [],
          dealbreakers: data.dealbreakers || [],
          minAge: data.minAge || prev.minAge,
          maxAge: data.maxAge || prev.maxAge,
          distance: data.distance || prev.distance,
          types: data.types || prev.types,
        }));
        setToggles((prev) => ({
          ...prev, 
          showProfile: !data.hideProfile === false,
          aiRecommendations: !!data.chatNotifications, 
        }));
        

      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
  
    const fetchLikesCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("⚠️ No token found in localStorage");
          return;
        }
        const res = await axios.get(`${BASE_URL}/api/likes/received/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setLikesThisWeek(res.data.count);
      } catch (err) {
        console.error("❌ Failed to fetch likes:", err);
      }
    };
  
    fetchProfile();       // ✅ calls the profile fetch
    fetchLikesCount();    // ✅ calls the likes count fetch
    fetchUnreadNotifications();
  }, []);
  const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
  
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  };
  
  const fetchRecentMatches = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/matches/recent/${localStorage.getItem("rememberedUser") || sessionStorage.getItem("loggedInUser")}`);

  
      if (res.data.success) {
        const shuffled = shuffle(res.data.recentMatches);
        console.log("🌀 Shuffled Matches:", shuffled);
        setRecentMatches(shuffled.slice(0, 2));
      }
    } catch (err) {
      console.error("❌ Failed to fetch recent matches:", err);
    }
  };
  
  
  useEffect(() => {
    fetchRecentMatches(); 
  
    const interval = setInterval(() => {
      fetchRecentMatches(); 
    },40000); 
  
    return () => clearInterval(interval); 
  }, []);
  
  
  useEffect(() => {
  if (toggles.darkMode) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}, [toggles.darkMode]);

useEffect(() => {
  socket.on("chatNotificationsToggled", ({ email, enabled }) => {
    if (
      email ===
      (localStorage.getItem("rememberedUser") ||
        sessionStorage.getItem("loggedInUser"))
    ) {
      setToggles((prev) => ({ ...prev, aiRecommendations: enabled }));
    }
  });

  return () => {
    socket.off("chatNotificationsToggled");
  };
}, []);
useEffect(() => {
  const currentUserEmail =
    localStorage.getItem("rememberedUser") ||
    sessionStorage.getItem("loggedInUser");

  socket.on("newChatNotification", ({ email, name, senderEmail }) => {
    // Only show if this is the current user & they have notifications on
    if (email === currentUserEmail && toggles.aiRecommendations) {
      setUnreadSenders((prev) => {
        const alreadyExists = prev.some((s) => s.email === senderEmail);
        if (!alreadyExists) {
          return [...prev, { name, email: senderEmail }];
        }
        return prev;
      });
    }
  });

  return () => {
    socket.off("newChatNotification");
  };
}, [toggles.aiRecommendations]);

  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: value }));
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
  
      // Update name and location in database
      await axios.put(`${BASE_URL}/api/user/update-basic-info`, {
        name: profile.name,
        location: profile.location,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
  
      // Update preferences like distance, age, etc.
      await axios.put(`${BASE_URL}/api/user/preferences`, {
          minAge: profile.minAge,
          maxAge: profile.maxAge,
          distance: profile.distance,
          relationshipGoal:
            profile.types.casual
              ? "casual"
              : profile.types.romantic
              ? "romantic"
              : profile.types.adventurous
              ? "adventurous"
              : "",
          types: profile.types,
          dealbreakers: profile.dealbreakers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setEditingProfile(false);
    } catch (error) {
      console.error("❌ Error saving profile:", error);
    }
  };
  

  const handleAboutChange = (e) => {
    const { value } = e.target;
    if (value.length <= 200) {
      setProfile((prev) => ({ ...prev, aboutMe: value }));
    }
  };

  const saveBio = async () => {
    try {
      const token = localStorage.getItem("token");
  
      await axios.put(`${BASE_URL}/api/user/about-me`, {
        aboutMe: profile.aboutMe,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
  
      setEditingBio(false);
      setBioSaved(true);
      setTimeout(() => setBioSaved(false), 2000);
    } catch (err) {
      console.error("❌ Failed to save About Me:", err);
    }
  };
  
  const savePreferences = async () => {
    const token = localStorage.getItem("token");
  
    // Get the selected relationshipGoal
    const relationshipGoal = Object.entries(profile.types).find(
      ([type, isChecked]) => isChecked
    )?.[0];
  
    try {
      const res = await axios.put(`${BASE_URL}/api/user/preferences`, {
          minAge: profile.minAge,
          maxAge: profile.maxAge,
          distance: profile.distance,
          types: profile.types,
          hobbies: profile.interests, 
          dealbreakers: profile.dealbreakers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("✅ Preferences saved:", res.data);
      setPrefsChanged(false);
    } catch (err) {
      console.error("❌ Failed to save preferences:", err);
    }
  };
  
  const addInterest = () => {
    if (newTag && !profile.interests.includes(newTag)) {
      setProfile((prev) => ({
        ...prev,
        interests: [...prev.interests, newTag],
      }));
      setNewTag("");
      setPrefsChanged(true); // ✅ Trigger save button
    }
  };
  
  const removeInterest = (tag) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.filter((t) => t !== tag),
    }));
    setPrefsChanged(true); // ✅ Trigger save button
  };
  

  const handleSliderChange = (e) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: Number(value) }));
    setPrefsChanged(true); // ✅ flag as changed
  };
  
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      types: { ...prev.types, [value]: checked },
    }));
    setPrefsChanged(true); // ✅ flag as changed
  };
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("image", file);
    setUploadingImage(true);
  
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BASE_URL}/api/upload/upload-profile-pic`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
  
      const newUrl = response.data.url + `?cb=${Date.now()}`; // 💡 cache-busting trick
      setProfile((prev) => ({
        ...prev,
        profilePicUrl: newUrl,
      }));
    } catch (err) {
      console.error("❌ Failed to upload image:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };
  
  

  const toggleSetting = async (key) => {
    const newValue = !toggles[key];
    setToggles((prev) => ({
      ...prev,
      [key]: newValue,
    }));

  
    // Save dark mode setting to localStorage
    if (key === "darkMode") {
      if (newValue) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "true");
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.removeItem("darkMode");
      }
    }
  
    try {
      const token = localStorage.getItem("token");
      const body = {};
      
      if (key === "showProfile") {
        body.hideProfile = newValue;
        socket.emit("profileVisibilityChanged", {
          email:
            profile.email ||
            localStorage.getItem("rememberedUser") ||
            sessionStorage.getItem("loggedInUser"),
          hidden: newValue,
        });        
      } else if (key === "aiRecommendations") {
        body.chatNotifications = newValue;
      }
      console.log("Saving setting:", key, "→", body);

  
      await axios.put(`${BASE_URL}/api/user/settings/toggles`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (key === "aiRecommendations") {
        body.chatNotifications = newValue;
      
        socket.emit("chatNotificationsToggled", {
          email:
            profile.email ||
            localStorage.getItem("rememberedUser") ||
            sessionStorage.getItem("loggedInUser"),
          enabled: newValue,
        });
      }
      
      console.log(`✅ Updated setting: ${key}`);
    } catch (err) {
      console.error(`❌ Failed to update setting: ${key}`, err);
    }
  };
  
  const goToChat = async (senderEmail) => {
    try {
      const token = localStorage.getItem("token");
  
      await axios.post(`${BASE_URL}/api/chat/mark-read`, {
        senderEmail,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
  
      // Clear the unread notification
      setUnreadSenders([]);
  
      // Redirect to chat
      navigate(`/chat/${senderEmail}`);
    } catch (err) {
      console.error("❌ Failed to mark messages as read or redirect:", err);
    }
  };
  
  
  

  return (
    <div className="profile-page">
      <header className="header">
        <div className="profile-layout">
          <div className="logo">
            <a href="/" className="logo-img">
              <img src={logo} alt="CupidPlan Logo" />
            </a>
            <span className="logo-text">CupidPlan.Me</span>
          </div>
          <div className="buttons">
            <button className="btn">
              <i className="fa-regular fa-bell icon"></i>
            </button>
            <button className="btn">
              <i className="fa-regular fa-message icon"></i>
            </button>
            
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="profile-header">
          <div className="background-overlay">
            <div className="container">
              <div className="profile-info">
              <div className="profile-img-container">
              <img
  src={profile.profilePicUrl || profilePic}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = profilePic;

    
    axios
      .delete("http://localhost:5000/api/upload/delete-profile-pic", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => {
        console.log(" Invalid profilePic cleaned from DB.");
        
        setProfile((prev) => ({
          ...prev,
          profilePicUrl: "",
        }));
      })
      .catch((err) => {
        console.error(" Cleanup failed:", err);
      });
  }}
  alt="Profile"
  className="profile-image"
/>









  <input
    type="file"
    id="profilePicInput"
    accept="image/*"
    style={{ display: "none" }}
    onChange={handleProfilePicChange}
  />

  {profile.profilePicUrl && (
    <button
      className="delete-picture-btn"
      onClick={async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${BASE_URL}/api/upload/delete-profile-pic`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          setProfile((prev) => ({ ...prev, profilePicUrl: "" }));
        } catch (err) {
          console.error("❌ Failed to delete profile picture:", err);
        }
      }}
    >
      Remove Picture
    </button>
  )}
                </div>
              </div>
              <div className="profile-details">
                <div className="profile-name-container">
                  <h1 className="profile-name">{profile.name}</h1>
                  <button
                    className="edit-profile-btn"
                    onClick={() => setEditingProfile(true)}
                  >
                    <i className="fa-solid fa-user-pen"></i>
                  </button>
                </div>
                <p className="profile-location-age">
                  {profile.location} • {profile.age} years old
                </p>
                {/* ✅ Add this new styled button here */}
  <button
    className="upload-profile-pic-undername-btn"
    onClick={() =>
      !uploadingImage && document.getElementById("profilePicInput").click()
    }
    disabled={uploadingImage}
  >
    {uploadingImage ? "Uploading..." : "📸 Add Profile Picture"}
  </button>
              </div>
            </div>
          </div>
        </div>

        {editingProfile && (
          <div className="popup">
            <div className="popup-content">
              <h2>Edit Profile</h2>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={profile.name}
                onChange={handleProfileChange}
              />
              <label htmlFor="location">Location:</label>
              <input
                type="text"
                id="location"
                value={profile.location}
                readOnly
                disabled
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
              />
              <label htmlFor="age">Age:</label>
<input
  type="number"
  id="age"
  value={profile.age}
  readOnly
  disabled
  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
/>

              <div className="popup-buttons">
                <button className="save-btn" onClick={saveProfile}>
                  Save
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setEditingProfile(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="profile-container">
          <div className="profile-grid">
            <div className="profile-left-col">
              <div className="about-me">
                <div className="profile-section">
                  <h2 className="section-title">About Me</h2>
                  <div className="edit-bio-btn-wrapper">
                    <button
                      className="edit-bio-btn"
                      onClick={() => setEditingBio(true)}
                    >
                      <i className="fa-regular fa-pen-to-square"></i>
                    </button>
                  </div>
                  {!editingBio && (
                    <p className="about-me-text">
                      {profile.aboutMe || "Tell us about yourself!"}
                    </p>
                  )}
                  {editingBio && (
                    <>
                      <textarea
                        className="about-me-textarea"
                        rows="4"
                        value={profile.aboutMe}
                        onChange={handleAboutChange}
                        placeholder="Share something about yourself..."
                      />
                      <p className="char-counter">
                        {profile.aboutMe.length} / 200
                      </p>
                      <button className="save-bio-btn" onClick={saveBio}>
                        Save
                      </button>
                      {bioSaved && (
                        <p className="bio-saved-message">Bio saved!</p>
                      )}
                    </>
                  )}
                  <div className="interest-tags">
                    <div className="tags-container">
                      {profile.interests.map((tag, index) => (
                        <span
                          key={index}
                          className="tag"
                          onClick={() => removeInterest(tag)}
                        >
                          {tag} <span className="remove-tag">×</span>
                        </span>
                      ))}
                    </div>
                    {showTagInput ? (
                      <input
                        type="text"
                        className="tag-input"
                        placeholder="Add Interest"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addInterest();
                            setShowTagInput(false);
                          }
                        }}
                        onBlur={() => setShowTagInput(false)}
                      />
                    ) : (
                      <button
                        className="add-interest-btn"
                        onClick={() => setShowTagInput(true)}
                      >
                        + Add Interest
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="dating-preferences">
                <div className="profile-section">
                  <h2 className="section-title">Dating Preferences</h2>
                  <div className="age-range">
                    <label>Age Range</label>
                    <div className="age-range-box">
                      <input
                        type="number"
                        id="minAge"
                        value={profile.minAge}
                        min="18"
                        onChange={handleSliderChange}
                      />
                      <span>to</span>
                      <input
                        type="number"
                        id="maxAge"
                        value={profile.maxAge}
                        min="18"
                        onChange={handleSliderChange}
                      />
                    </div>
                  </div>
                  <div className="distance">
                    <label>Distance</label>
                    <input
                      type="range"
                      id="distance"
                      min="0"
                      max="100"
                      value={profile.distance}
                      onChange={handleSliderChange}
                    />
                    <span>Within {profile.distance} miles</span>
                  </div>
                  <div className="date-types-section">
                    <label>Date Types</label>
                    <div className="date-checklist">
                      {["casual", "romantic", "adventurous"].map((type) => (
                        <label key={type} className="date-checkbox-label">
                          <input
                            type="checkbox"
                            value={type}
                            checked={!!profile.types[type]}
                            onChange={handleCheckboxChange}
                          />
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </label>
                      ))}
                    </div>
                    {prefsChanged && (
  <button className="save-preferences-btn" onClick={savePreferences}>
    Save Preferences
  </button>
)}

                  </div>
                </div>
              </div>

              <div className="match-history">
                <h2 className="section-title">Recent Matches</h2>
                <div className="match-history-grid">
                {recentMatches.map((match, index) => (
  <div className="match-box" key={index}>
    <div className="match-box-content">
      <img
        src={match.profilePicUrl || profilePic}
        alt="Match"
        className="match-profile"
      />
      <div className="match-details">
        <h3 className="match-name">{match.name}</h3>
        <p className="match-timeframe">
  {match.sharedHobbies?.length > 0
    ? `You both like ${match.sharedHobbies[0]}!`
    : `Someone new to explore!`}
</p>

      </div>
    </div>
  </div>
))}
                </div>
              </div>
            </div>

            <div className="profile-right-col">
              <div className="stats-container">
                <div className="photo-album-btn-container">
                <button className="photo-album-btn" onClick={() => navigate("/album")}>
  📷 Photo Album
</button>

</div>

<h2 className="section-title">💡Match Tip</h2>
<div className="stats-box-content">
  <i className="fa-solid fa-heart-circle-bolt stats-icon"></i>
  <div className="stats-details">
    <h3 className="stats-value">Add more interests</h3>
    <p className="stats-timeframe">More shared vibes = better matches</p>
  </div>
</div>

                {unreadSenders.length > 0 && toggles.aiRecommendations ? (
  <div className="stats-box-content chat-alert">
  <i className="fa-solid fa-message stats-icon"></i>
  <div className="stats-details">
    <h3 className="stats-value">New Messages</h3>
    {unreadSenders.map((sender) => (
      <div
        key={sender.email}
        className="chat-alert-message"
        onClick={() => goToChat(sender.email)}
      >
        <strong className="sender-name">{sender.name}</strong> sent you a message
        <p className="click-to-chat">Click to chat</p>
      </div>
    ))}
  </div>
</div>

) : (
  <div className="stats-box-content cute-cupid">
  <img src={cupidPlan} alt="Cupid Plan" className="cupid-image" />
</div>

)}



                <button className="vip-upgrade-btn">Upgrade to VIP</button>
              </div>

              <div className="profile-settings">
                <h2 className="section-title">Settings</h2>
                <div className="settings-box-content">
                <span className="settings-label">Hide Profile</span>
                  <button
                    className={`toggle-switch ${
                      toggles.showProfile ? "active" : ""
                    }`}
                    onClick={() => toggleSetting("showProfile")}
                  >
                    <div className="toggle-circle"></div>
                  </button>
                </div>
                <div className="settings-box-content">
                <span className="settings-label">Chat Notifications</span>
                  <button
                    className={`toggle-switch ${
                      toggles.aiRecommendations ? "active" : ""
                    }`}
                    onClick={() => toggleSetting("aiRecommendations")}
                  >
                    <div className="toggle-circle"></div>
                  </button>
                </div>
                <div className="settings-box-content">
                  <span className="settings-label">Dark mode</span>
                  <button
                    className={`toggle-switch ${
                      toggles.darkMode ? "active" : ""
                    }`}
                    onClick={() => toggleSetting("darkMode")}
                  >
                    <div className="toggle-circle"></div>
                  </button>
                </div>
                <div className="profile-section">
  <h2 className="section-title">Dealbreakers</h2>
  <div className="interest-tags">
    <div className="tags-container">
      {profile.dealbreakers.map((tag, index) => (
        <span
          key={index}
          className="tag"
          onClick={() => {
            setProfile((prev) => ({
              ...prev,
              dealbreakers: prev.dealbreakers.filter((t) => t !== tag),
            }));
            setPrefsChanged(true);
          }}
        >
          {tag} <span className="remove-tag">×</span>
        </span>
      ))}
    </div>
    {showTagInput === "dealbreaker" ? (
      <input
        type="text"
        className="tag-input"
        placeholder="Add Dealbreaker"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (newTag && !profile.dealbreakers.includes(newTag)) {
              setProfile((prev) => ({
                ...prev,
                dealbreakers: [...prev.dealbreakers, newTag],
              }));
              setPrefsChanged(true);
            }
            setNewTag("");
            setShowTagInput(false);
          }
        }}
        onBlur={() => setShowTagInput(false)}
      />
    ) : (
      <button
        className="add-interest-btn"
        onClick={() => setShowTagInput("dealbreaker")}
      >
        + Add Dealbreaker
      </button>
    )}
  </div>
</div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
