import React from "react";
import { Link } from "react-router-dom";
import "../styles/NavBar.css"; 

const About = () => {
  return (
    <div className="page-container">
      <h1>About CupidPlan.Me</h1>
      <p>Welcome to CupidPlan.Me, where meaningful connections begin. Our platform is designed to foster real relationships based on compatibility, shared interests, and effortless date planning.</p>

      <h2>Our Story</h2>
      <p>Dating should be **fun, exciting, and stress-free**—but often, people struggle with **finding the right match** or **planning creative dates**. That’s why we built CupidPlan.Me, a smarter way to date. With **AI-powered matchmaking and personalized date planning**, we take the hassle out of dating so you can focus on building meaningful connections.</p>

      <p>Founded by relationship enthusiasts and tech experts, CupidPlan.Me **removes the stress of coming up with date ideas** and instead provides **tailored experiences that match your personality and preferences.** Our goal is to **make dating easy, enjoyable, and unforgettable.**</p>

      <h2>Why Choose CupidPlan.Me?</h2>
      <ul>
        <li>💙 <strong>AI-Powered Matchmaking</strong> – Our advanced algorithm finds compatible partners based on deep personality analysis, not just surface-level attraction.</li>
        <li>🤖 <strong>AI-Generated Date Ideas</strong> – No more stressing about what to do! Our AI suggests customized date experiences based on mutual interests, location, and budget.</li>
        <li>🔒 <strong>Secure & Private</strong> – All profiles are verified, and your data is encrypted for maximum safety.</li>
        <li>📞 <strong>24/7 Support</strong> – Our customer support team is always available to assist you.</li>
        <li>🌍 <strong>A Growing Community</strong> – Join thousands of active users looking for real, meaningful connections.</li>
      </ul>

      <h2>What Makes CupidPlan.Me Different?</h2>
      <p>Unlike traditional dating apps, **CupidPlan.Me goes beyond just matching users—we create the entire dating experience for you.** No more last-minute scrambling to figure out where to go or what to do—we handle that for you!</p>

      <h3>🔹 AI-Powered Date Planning</h3>
      <p>Struggling to come up with date ideas? Our AI generates **personalized date recommendations** based on your preferences, past interactions, and real-time location.</p>

      <h3>🔹 Verified Profiles for Safety</h3>
      <p>We require email verification and offer additional verification methods to reduce fake accounts and ensure a safe dating environment.</p>

      <h3>🔹 Icebreakers & Conversation Starters</h3>
      <p>Awkward silences? Not on CupidPlan.Me. Our platform provides fun icebreakers to **help spark engaging conversations** between matches.</p>

      <h3>🔹 Smart Scheduling</h3>
      <p>Once a match is made, **our AI helps coordinate the best time and place** for your date, taking into account your availability and preferences.</p>

      <h3>🔹 Commitment to Respect & Inclusivity</h3>
      <p>We believe in a dating space that welcomes **all genders, orientations, and backgrounds**. Everyone deserves love, and we ensure a respectful, harassment-free environment.</p>

      <h2>Join CupidPlan.Me Today</h2>
      <p>Whether you're here for love, companionship, or a fun date night, **CupidPlan.Me is the only dating platform that matches you and plans your dates effortlessly.** Sign up today and let us take care of everything!</p>

      <div className="page-footer">
        <Link to="/terms" className="nav-button">Terms of Service</Link>
        <Link to="/privacy" className="nav-button">Privacy Policy</Link>
        <Link to="/community" className="nav-button">Community Guidelines</Link>
      </div>

      <div className="back-home-container">
        <Link to="/" className="nav-button">Back to Home</Link>
      </div>
    </div>
  );
};

export default About;
