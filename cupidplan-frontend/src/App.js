import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Matches from './pages/Matches';
import Dates from './pages/Dates';

function App() {
  return (
    <div className="min-h-screen text-center p-8">
      <Routes>
        {/* Login Page - No Navbar */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes (Show Navbar) */}
        <Route
          path="/*"
          element={
            <div>
              <nav className="flex justify-center space-x-4 bg-blue-500 p-4 text-white">
                <Link to="/home" className="hover:underline">Home</Link>
                <Link to="/profile" className="hover:underline">Profile</Link>
                <Link to="/matches" className="hover:underline">Matches</Link>
                <Link to="/dates" className="hover:underline">Dates</Link>
              </nav>
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/dates" element={<Dates />} />
              </Routes>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
