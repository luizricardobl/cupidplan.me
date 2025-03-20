import React from "react";
import { Link } from "react-router-dom";
import "../styles/NavBar.css"; 

const Community = () => {
  return (
    <div className="page-container">
      <h1>Community Guidelines</h1>
      <p><strong>Last Updated: 03/11/2025</strong></p>

      <h2>1. Be Respectful</h2>
      <p>CupidPlan.Me is a space for meaningful connections. Users must treat others with kindness, respect, and integrity.</p>

      <h2>2. No Harassment or Bullying</h2>
      <p>Harassment, stalking, hate speech, or intimidation of any kind will not be tolerated and may result in an account ban.</p>

      <h2>3. No Fake Profiles or Scamming</h2>
      <p>All users must provide accurate profile information. Fake accounts, catfishing, and fraudulent activity are strictly prohibited.</p>

      <h2>4. Keep It Safe</h2>
      <p>Never share sensitive personal information (such as financial details, home address, or passwords) with other users.</p>

      <h2>5. Reporting Violations</h2>
      <p>If you experience harassment, threats, or other violations of these guidelines, please report the user through the platform’s reporting system or contact support.</p>

      <div className="page-footer">
        <Link to="/privacy" className="nav-button">Privacy Policy</Link>
        <Link to="/terms" className="nav-button">Terms of Service</Link>
        <Link to="/" className="nav-button">Back to Home</Link>
      </div>
    </div>
  );
};

export default Community;
