import React, {useState} from "react";
import "../styles/Matches.css";

//Placeholder profiles TODO: Replace with actual data from DB/backend
const profiles = [
    {
        id: 1,
        name: "Sarah",
        age: 28,
        job: "Software Engineer",
        distance: "2 miles away",
        matchPercentage: 94,
        avatar: "https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=456",
    },
    {
        id: 2,
        name: "Emma",
        age: 26,
        job: "Designer",
        distance: "5 miles away",
        matchPercentage: 88,
        avatar: "https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=102",
    },
];

const Matches = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % profiles.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? profiles.length - 1 : prevIndex - 1
        );
    };

    const profile = profiles[currentIndex];

    return (
        <div className="match-container">
            <h1 className="match-header">CupidPlan.me</h1> {/*TODO: Move this to the navbar*/}
            <div className="profile-card">
                <img src={profile.avatar} alt={profile.name} className="profile-image" />

                <div className="profile-info">
                    <h2>{profile.name}, {profile.age}</h2>
                    <p>{profile.job}</p>
                    <p>{profile.distance}</p>
                    <p className="match-percentage">{profile.matchPercentage}% Match</p>

                    <div className="action-buttons">
                        <button className="chat-button">Start Chat</button> {/*TODO: Link to chat page*/}
                        <button className="profile-button">View Profile</button> {/*TODO: Link to profile page*/}
                    </div>
                </div>
            </div>

            <div className="nav-buttons">
                <button onClick={handlePrev} className="nav-button">⬅ Prev</button>
                <span>{currentIndex + 1} / {profiles.length}</span>
                <button onClick={handleNext} className="nav-button">Next ➡</button>
            </div>
        </div>
    );
};

export default Matches;
 
