import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Login.css";

const Login = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(30); // 30 seconds cooldown
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
      navigate("/home");
    }
    setTimeout(() => setShowLogin(true), 3000); // Delay login form display
  }, [navigate]);

  // ✅ Send OTP Request to Backend
  const handleSendOTP = async (e, isResend = false) => {
    e.preventDefault();

    if (!userInput.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userInput }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success(isResend ? "OTP resent to your email!" : "OTP sent to your email!");
        setStep(2);
      
        // Reset resend timer
        setResendDisabled(true);
        setTimer(30);
      
        // Start countdown
        const countdown = setInterval(() => {
          setTimer((prev) => {
            if (prev === 1) {
              clearInterval(countdown);
              setResendDisabled(false);
            }
            return prev - 1;
          });
        }, 1000);
      
      } else {
        if (data.message === "User not found") {
          toast.error("No account found with this email. Please sign up first.");
        } else {
          toast.error(data.message || "Error sending OTP. Try again.");
        }
      } // <-- ✅ this ends the else block
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    }
  };


  // ✅ Verify OTP with Backend
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
  
    if (!otp.trim()) {
      toast.error("Please enter the OTP.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userInput, otp }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        toast.success("OTP verified successfully!");
  
        // ✅ Store login based on "Remember Me" selection
        if (rememberMe) {
          localStorage.setItem("rememberedUser", userInput);
        } else {
          sessionStorage.setItem("loggedInUser", userInput); // Store for session only
        }
  
        setTimeout(() => navigate("/home"), 1000); // Redirect after success
      } else {
        toast.error("Invalid OTP. Try again.");
      }
    } catch (error) {
      toast.error("Failed to verify OTP.");
    }
  };
  

  // ✅ Handle Logout (Clear Remember Me)
  const handleLogout = () => {
    localStorage.removeItem("rememberedUser");
    navigate("/");
  };

  return (
    <div className="login-container">
      <ToastContainer />
      {!showLogin ? (
        <div className="cupid-animation">
          <img src="/images/cupid-logo.png" alt="Cupid Logo" className="cupid-logo" />
        </div>
      ) : (
        <div className="login-box">
          <h1>Welcome to CupidPlan.Me</h1>
          <p>Find your perfect match!</p>

          {step === 1 ? (
            <form onSubmit={handleSendOTP}>
              <input
                type="text"
                id="userInput"
                name="userInput"
                placeholder="Email Address"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                required
              />
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <button type="submit">Send OTP</button>
            </form>
          ) : (
            <>
              <form onSubmit={handleVerifyOTP}>
                <input
                  type="text"
                  id="otpInput"
                  name="otpInput"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button type="submit">Verify OTP</button>
              </form>

              {/* Resend OTP Button */}
              <button
                onClick={(e) => handleSendOTP(e, true)}
                disabled={resendDisabled}
                className={resendDisabled ? "resend-disabled" : "resend-active"}
              >
                {resendDisabled ? `Resend OTP in ${timer}s` : "Resend OTP"}
              </button>
            </>
          )}

          {/* New Signup Button Below Send OTP */}
          <div className=".signup-container">
            <p>New to CupidPlan.Me?</p>
            <button className="signup-button" onClick={() => navigate("/signup")}>
              Create an Account
            </button>
          </div>

          <div className="testimonials">
            <h3>💬 What Our Users Say</h3>
            <p>"CupidPlan helped me find the love of my life!" - Alex</p>
            <p>"Met amazing people! Highly recommended." - Sam</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
