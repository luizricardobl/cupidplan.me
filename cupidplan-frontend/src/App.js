import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from "./pages/Signup";
import Home from './pages/Home';
import Profile from './components/Profile';
import Matches from './pages/Matches';
import Dates from './pages/Dates';
import Help from './pages/Help';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Community from './pages/Community';
import Chat from "./pages/Chat";
import "./styles/NavBar.css"; 

function App() {
  const location = useLocation(); 
  const isLoginPage = location.pathname === "/"; 
  const isSignupPage = location.pathname === "/signup"; 
  const isRestrictedPage = ["/help", "/about", "/terms", "/privacy", "/community"].includes(location.pathname); 
  const isLoggedIn = !isLoginPage && !isSignupPage && !isRestrictedPage; 

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="nav-bar">
        {/* Always Show Home Button */}
        <div className="nav-links">
          <Link to="/home" className="nav-button">Home</Link>
          {isLoggedIn && (
            <>
              <Link to="/profile" className="nav-button">Profile</Link>
              <Link to="/matches" className="nav-button">Matches</Link>
              <Link to="/dates" className="nav-button">Dates</Link>
            </>
          )}
        </div>

        {/* Show Help & About ONLY on Login or Restricted Pages */}
        {(isLoginPage || isRestrictedPage) && (
          <div className="top-right-buttons">
            <Link to="/help" className="top-button">Help</Link>
            <Link to="/about" className="top-button">About</Link>
          </div>
        )}

        {/* Logout Button (Only Show When Logged In) */}
        {isLoggedIn && (
          <button className="logout-button" onClick={() => window.location.href = "/"}>
            Logout
          </button>
        )}
      </nav>

      {/* Page Routing */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/dates" element={<Dates />} />
        <Route path="/help" element={<Help />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/community" element={<Community />} />
        <Route path="/chat" element={<Chat />} />

      </Routes>
    </div>
  );
}

export default App;
