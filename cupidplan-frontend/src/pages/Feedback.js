import React, { useState } from "react";
import axios from "axios";
import "../styles/Feedback.css";
import { useEffect } from "react";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://cupidplan-me.onrender.com";

const Feedback = () => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [emoji, setEmoji] = useState("");
  const [category, setCategory] = useState("General");
  const [recommend, setRecommend] = useState("Yes");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${BASE_URL}/api/feedback/submit`, {
        name,
        rating,
        comment,
        emoji,
        category,
        recommend,
      });

      setSubmitted(true);
      setName("");
      setRating(5);
      setComment("");
      setEmoji("");
      setCategory("General");
      setRecommend("Yes");
    } catch (err) {
      console.error("❌ Failed to send feedback:", err);
    }
  };
  useEffect(() => {
    const email =
      localStorage.getItem("rememberedUser") || sessionStorage.getItem("loggedInUser");
  
    if (email) {
      + fetch(`${BASE_URL}/api/user/by-email/${email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setName(data.data.name);
          }
        })
        .catch((err) => console.error("❌ Error fetching user:", err));
    }
  }, []);
  
  return (
    <div className="feedback-container">
      <h1>📝 We’d love your feedback!</h1>
      {submitted ? (
        <div className="success-visual">
          <h2>🎉 Thanks for helping Cupid improve!</h2>
          <p>We appreciate your time and thoughts 💘</p>
        </div>
      ) : (
        <form className="feedback-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            readOnly
            className="readonly-name"
          />

          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{`${r} ★`}</option>
            ))}
          </select>

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="General">General</option>
            <option value="Bug Report">Bug Report</option>
            <option value="Feature Request">Feature Request</option>
            <option value="UI Feedback">UI Feedback</option>
          </select>

          <select value={recommend} onChange={(e) => setRecommend(e.target.value)}>
            <option value="Yes">Would recommend</option>
            <option value="No">Would not recommend</option>
          </select>

          <select value={emoji} onChange={(e) => setEmoji(e.target.value)}>
  <option value="">Choose an emoji</option>
  <option value="😊">😊 Happy</option>
  <option value="😍">😍 Love it</option>
  <option value="😐">😐 Neutral</option>
  <option value="😕">😕 Confused</option>
  <option value="😡">😡 Frustrated</option>
</select>


          <textarea
            placeholder="Write your experience..."
            maxLength={300}
            value={comment}
            required
            onChange={(e) => setComment(e.target.value)}
          />
          <p className="char-count">{comment.length}/300 characters</p>

          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default Feedback;
