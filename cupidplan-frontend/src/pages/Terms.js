import React from "react";
import { Link } from "react-router-dom";
import "../styles/NavBar.css"; 

const Terms = () => {
  return (
    <div className="page-container">
      <h1>Terms of Service</h1>
      <p><strong>Last Updated: 03/11/2025</strong></p>

      <h2>1. Introduction</h2>
      <p>Welcome to CupidPlan.Me! By accessing and using our website, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>

      <h2>2. Eligibility</h2>
      <ul>
        <li>You must be at least 18 years old to use CupidPlan.Me.</li>
        <li>You must provide accurate and up-to-date information when signing up.</li>
        <li>By using our platform, you confirm that you have not been convicted of any criminal offenses related to fraud, harassment, or online misconduct.</li>
      </ul>

      <h2>3. Acceptable Use</h2>
      <p>To maintain a respectful and secure dating environment, users agree to the following:</p>
      <ul>
        <li>Not to engage in harassment, hate speech, or spam.</li>
        <li>Not to impersonate another person or create fake profiles.</li>
        <li>Not to use CupidPlan.Me for commercial purposes or solicit money from other users.</li>
        <li>Not to share explicit or inappropriate content on the platform.</li>
      </ul>

      <h2>4. Account Termination</h2>
      <p>CupidPlan.Me reserves the right to suspend or terminate accounts that violate these Terms of Service. Users found engaging in misconduct may be banned from using our platform.</p>

      <h2>5. Liability & Disclaimers</h2>
      <p>CupidPlan.Me provides a matchmaking service but does not guarantee successful matches or relationships. We are not responsible for any actions or interactions between users.</p>

      <h2>6. Changes to These Terms</h2>
      <p>We may update these Terms from time to time. Users will be notified of significant changes via email or a site-wide announcement.</p>

      <div className="page-footer">
        <Link to="/privacy" className="nav-button">Privacy Policy</Link>
        <Link to="/community" className="nav-button">Community Guidelines</Link>
        <Link to="/" className="nav-button">Back to Home</Link>
      </div>
    </div>
  );
};

export default Terms;
