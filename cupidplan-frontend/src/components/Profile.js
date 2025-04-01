import React, { useState } from "react";
import "../styles/profile.css";
import profilePic from "../assets/default-profile.jpg";
import logo from "../assets/cupid-plan-logo-2.png";
import { useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [prefsChanged, setPrefsChanged] = useState(false);
  const [bioSaved, setBioSaved] = useState(false);
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
  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // or sessionStorage
        console.log("Token being used:", token);
        const response = await axios.get("http://localhost:5000/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const data = response.data;
  
        setProfile((prev) => ({
          ...prev,
          name: data.name || prev.name,
          location: data.location || prev.location,
          age: data.dob ? new Date().getFullYear() - new Date(data.dob).getFullYear() : prev.age,
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
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
  
    fetchProfile();
  }, []);
  

  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: value }));
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
  
      await axios.put(
        "http://localhost:5000/api/user/preferences",
        {
          minAge: profile.minAge,
          maxAge: profile.maxAge,
          distance: profile.distance,
          relationshipGoal: profile.types.casual ? "casual" : profile.types.romantic ? "romantic" : profile.types.adventurous ? "adventurous" : "",
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
      console.error("Error saving profile preferences:", error);
    }
  };

  const handleAboutChange = (e) => {
    const { value } = e.target;
    if (value.length <= 200) {
      setProfile((prev) => ({ ...prev, aboutMe: value }));
    }
  };

  const saveBio = () => {
    setEditingBio(false);
    setBioSaved(true);
    setTimeout(() => setBioSaved(false), 2000);
  };
  const savePreferences = async () => {
    const token = localStorage.getItem("token");
  
    // Get the selected relationshipGoal
    const relationshipGoal = Object.entries(profile.types).find(
      ([type, isChecked]) => isChecked
    )?.[0];
  
    try {
      const res = await axios.put(
        "http://localhost:5000/api/user/preferences",
        {
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
      const response = await axios.post("http://localhost:5000/api/upload/upload-profile-pic", formData, {
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
  
  

  const toggleSetting = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
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
    alt="Profile"
    className="profile-image"
  />

<button
  className="camera-button"
  onClick={() => !uploadingImage && document.getElementById("profilePicInput").click()}
  disabled={uploadingImage}
  title={uploadingImage ? "Uploading..." : "Upload new picture"}
>
  <i className="fa-solid fa-camera"></i>
</button>


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
          await axios.delete("http://localhost:5000/api/upload/delete-profile-pic", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
                onChange={handleProfileChange}
              />
              <label htmlFor="age">Age:</label>
              <input
                type="number"
                id="age"
                value={profile.age}
                min="18"
                onChange={handleProfileChange}
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
                  <div className="match-box">
                    <div className="match-box-content">
                      <img
                        src={profilePic}
                        alt="Match"
                        className="match-profile"
                      />
                      <div className="match-details">
                        <h3 className="match-name">Sarah Parker</h3>
                        <p className="match-timeframe">Matched 2 days ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="match-box">
                    <div className="match-box-content">
                      <img
                        src={profilePic}
                        alt="Match"
                        className="match-profile"
                      />
                      <div className="match-details">
                        <h3 className="match-name">John Smith</h3>
                        <p className="match-timeframe">Matched 3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-right-col">
              <div className="stats-container">
                <h2 className="section-title">Profile Statistics</h2>
                <div className="stats-box-content">
                  <i className="fa-solid fa-heart stats-icon"></i>
                  <div className="stats-details">
                    <h3 className="stats-value">30 Likes</h3>
                    <p className="stats-timeframe">This week</p>
                  </div>
                </div>
                <div className="stats-box-content">
                  <i className="fa-solid fa-user-group stats-icon"></i>
                  <div className="stats-details">
                    <h3 className="stats-value">10 Matches</h3>
                    <p className="stats-timeframe">This month</p>
                  </div>
                </div>
                <button className="vip-upgrade-btn">Upgrade to VIP</button>
              </div>

              <div className="profile-settings">
                <h2 className="section-title">Settings</h2>
                <div className="settings-box-content">
                  <span className="settings-label">Show profile to new users</span>
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
                  <span className="settings-label">AI date recommendations</span>
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
