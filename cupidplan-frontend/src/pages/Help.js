import React from "react";
import { Link } from "react-router-dom";
import "../styles/Help.css"; 

const Help = () => {
  return (
    <div className="help-container">
      <h1>Help & Support – CupidPlan.Me</h1>
      <p>Welcome to CupidPlan.Me Support!</p>
      <p>We're here to help! Whether you're experiencing technical issues, need assistance with your profile, or have questions about our features, you've come to the right place.</p>

      <h2>Frequently Asked Questions (FAQs)</h2>

      {/* Getting Started */}
      <h3>Getting Started</h3>
      <p><strong>Q:</strong> How do I create an account?</p>
      <p><strong>A:</strong> Click on the Sign Up button on the homepage, fill in your details, complete the personality survey, and verify your email.</p>

      <p><strong>Q:</strong> I didn’t receive my verification email. What should I do?</p>
      <p><strong>A:</strong> Check your spam or junk folder. If you still don’t see it, click "Resend OTP" on the login page.</p>

      {/* Account & Profile */}
      <h3>Account & Profile</h3>
      <p><strong>Q:</strong> How do I update my profile information?</p>
      <p><strong>A:</strong> Navigate to <strong>Settings &gt; Edit Profile</strong>, make your changes, and click Save.</p>

      <p><strong>Q:</strong> Can I delete my account?</p>
      <p><strong>A:</strong> Yes. Go to <strong>Settings &gt; Account Preferences &gt; Delete Account</strong> and follow the steps.</p>

      <p><strong>Q:</strong> How do I change my email or password?</p>
      <p><strong>A:</strong> Under <strong>Settings</strong>, you’ll find options to update both your email and password.</p>

      {/* Matching & Messaging */}
      <h3>Matching & Messaging</h3>
      <p><strong>Q:</strong> How does the matching algorithm work?</p>
      <p><strong>A:</strong> We use a compatibility-based system that considers your preferences, interests, and survey responses to suggest potential matches.</p>

      <p><strong>Q:</strong> Can I message anyone on CupidPlan.Me?</p>
      <p><strong>A:</strong> You can message users you’ve matched with. If you don’t see the chat option, ensure that both parties have shown interest in each other.</p>

      <p><strong>Q:</strong> How do I unmatch or block someone?</p>
      <p><strong>A:</strong> Go to their profile, select <strong>More Options</strong>, and choose either <strong>Unmatch</strong> or <strong>Block</strong>. This action is permanent.</p>

      {/* Reporting & Safety */}
      <h3>Reporting & Safety</h3>
      <p><strong>Q:</strong> How do I report a user for inappropriate behavior?</p>
      <p><strong>A:</strong> Go to the user’s profile, click <strong>Report</strong>, and provide details. Our team will review the report.</p>

      <p><strong>Q:</strong> Is my personal information secure?</p>
      <p><strong>A:</strong> Yes. We prioritize your privacy and use encryption to protect your data. For more details, review our <Link to="/privacy">Privacy Policy</Link>.</p>

      <p><strong>Q:</strong> What safety measures does CupidPlan.Me take?</p>
      <p><strong>A:</strong> We have AI moderation, profile verification, and manual reviews to ensure a safe dating experience.</p>

      {/* Troubleshooting & Technical Issues */}
      <h3>Troubleshooting & Technical Issues</h3>
      <p><strong>Q:</strong> The site isn’t loading properly. What can I do?</p>
      <p><strong>A:</strong> Try clearing your browser cache, disabling extensions, or using a different browser. If the issue persists, contact support.</p>

      <p><strong>Q:</strong> I found a bug or issue. How do I report it?</p>
      <p><strong>A:</strong> Please email us at <a href="mailto:steeven.jolicoeur001@umb.edu">steeven.jolicoeur001@umb.edu</a> with a description of the issue and screenshots if possible.</p>

      {/* Billing & Subscription */}
      <h3>Billing & Subscription</h3>
      <p><strong>Q:</strong> Does CupidPlan.Me have premium features?</p>
      <p><strong>A:</strong> Yes! We offer premium subscriptions with enhanced matchmaking and unlimited messaging.</p>

      <p><strong>Q:</strong> How do I cancel my subscription?</p>
      <p><strong>A:</strong> You can cancel through <strong>Settings &gt; Subscription &gt; Manage Subscription</strong>.</p>

      <p><strong>Q:</strong> Do you offer refunds?</p>
      <p><strong>A:</strong> Refunds are handled on a case-by-case basis. Contact our support team for more information.</p>

      {/* Contact Support */}
      <h2>Contact Support</h2>
      <p>📧 Email: <a href="mailto:steeven.jolicoeur001@umb.edu">steeven.jolicoeur001@umb.edu</a></p>
      <p>📍 Support Hours: Monday – Friday, 9 AM – 6 PM (EST)</p>

      {/* Additional Resources */}
      <div className="page-footer">
  <Link to="/terms" className="nav-button">Terms of Service</Link>
  <Link to="/privacy" className="nav-button">Privacy Policy</Link>
  <Link to="/guidelines" className="nav-button">Community Guidelines</Link>
  <Link to="/" className="nav-button">Back to Home</Link>
</div>
    </div>
  );
};

export default Help;
