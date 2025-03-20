import React from "react";
import { Link } from "react-router-dom";
import "../styles/NavBar.css"; 

const Privacy = () => {
  return (
    <div className="page-container">
      <h1>Privacy Policy</h1>
      <p><strong>Last Updated: 03/11/2025</strong></p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li><strong>Personal Information:</strong> Name, email, gender, age, and dating preferences.</li>
        <li><strong>Usage Data:</strong> Activity on the platform, messages, and interactions with other users.</li>
        <li><strong>Location Data:</strong> If enabled, we collect location data to provide relevant matches and date ideas.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide personalized matchmaking services.</li>
        <li>To generate AI-powered date suggestions tailored to your interests.</li>
        <li>To enhance user experience and improve CupidPlan.Me.</li>
        <li>To ensure security and prevent fraudulent activity.</li>
      </ul>

      <h2>3. Data Protection</h2>
      <p>Your privacy is our top priority. We implement strict security measures to protect user data, including encryption and two-factor authentication.</p>

      <h2>4. Cookies & Tracking</h2>
      <p>CupidPlan.Me uses cookies to enhance your experience. Users can adjust cookie preferences in their browser settings.</p>

      <h2>5. Your Rights</h2>
      <ul>
        <li>You can request access, correction, or deletion of your personal data.</li>
        <li>You can disable data tracking through your account settings.</li>
        <li>Users can opt out of marketing emails at any time.</li>
      </ul>

      <div className="page-footer">
        <Link to="/terms" className="nav-button">Terms of Service</Link>
        <Link to="/community" className="nav-button">Community Guidelines</Link>
        <Link to="/" className="nav-button">Back to Home</Link>
      </div>
    </div>
  );
};

export default Privacy;
