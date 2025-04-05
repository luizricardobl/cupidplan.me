import React, { useState, useEffect, useRef} from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Signup.css"; // Keep using the same CSS

const Signup = () => {
  const [step, setStep] = useState(1); // Manage signup step
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profilePicture, setProfilePicture] = useState(null);
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [interestedIn, setInterestedIn] = useState("");
  const [location, setLocation] = useState("");
  const [aboutMe, setAboutMe] = useState("");

  const [relationshipGoal, setRelationshipGoal] = useState("");
  const [hobbies, setHobbies] = useState([]);
  const [dealbreakers, setDealbreakers] = useState([]);

  const [newHobby, setNewHobby] = useState(""); 
  const [newDealbreaker, setNewDealbreaker] = useState("");

  // OTP Verification
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);

  const navigate = useNavigate();

  // ✅ REFERENCE to the location input
  const locationInputRef = useRef(null);
  
  // New handler to listen to the autocomplete element's selection
  useEffect(() => {
    if (step === 2 && window.google && window.google.maps) {
      const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current, {
        types: ["geocode"]
      });
  
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place && place.formatted_address) {
          setLocation(place.formatted_address);
        }
      });
    }
  }, [step]);
  
  
  

  
  
  // Handle going to the next step
  const nextStep = async (e) => {
    e.preventDefault();
  
    // Step-based validation
    if (step === 1 && (!fullName || !email || !password || !confirmPassword)) {
      alert("❌ Please fill out all required fields.");
      return;
    }
  
    if (step === 1 && password !== confirmPassword) {
      alert("❌ Passwords do not match.");
      return;
    }
  
    if (step === 2 && (!dob || !gender || !interestedIn || !location)) {
      alert("❌ Please complete your profile details.");
      return;
    }
  
    if (step === 3 && !relationshipGoal) {
      alert("❌ Please select your relationship goal.");
      return;
    }
  
    if (step === 4) {
      const checkbox = document.querySelector('input[name="termsCheckbox"]');
      if (!checkbox?.checked) {
        alert("❌ You must agree to the Terms & Conditions.");
        return;
      }
  
      // ✅ Call handleSignup to save user + trigger OTP
      await handleSignup(e);
      return;
    }
  
    // Move to next step
    setStep(step + 1);
  };
  
  

  const handleSignup = async (e) => {
    e.preventDefault();
  
    if (!email) {
      alert("❌ Email is missing! Please enter your email.");
      return;
    }
  
    const userData = {
      name: fullName, // backend expects "name"
      email,
      phone,
      password,
      dob,
      gender,
      interestedIn,
      location,
      aboutMe,
      relationshipGoal,
      hobbies,
      dealbreakers,
    };

    console.log("📦 Sending this user data to backend:", userData);
    console.table(userData);

    try {
      // Step 1: Create user
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
  
      const data = await res.json();
  
      if (!res.ok || !data.success) {
        alert(data.message || "Signup failed.");
        return;
      }
  
      console.log("✅ Account created. Sending OTP...");
  
      // Step 2: Send OTP
      const otpRes = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const otpData = await otpRes.json();
  
      if (!otpRes.ok || !otpData.success) {
        alert(otpData.message || "Failed to send OTP.");
        return;
      }
  
      alert("✅ OTP sent! Please check your email.");
      setStep(5);
  
      // Start countdown timer
      setResendDisabled(true);
      setCountdown(30);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setResendDisabled(false);
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Signup error:", error);
      alert("❌ Signup failed. Try again.");
    }
  };
  

  // Handle going back to the previous step
  const prevStep = () => {
    setStep(step - 1);
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  // Handle OTP Input
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
  
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
  
      // ✅ Move focus only if next input exists
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (value && nextInput) {
        nextInput.focus();
      }
    }
  };
  

  // Handle OTP Submission
  const handleVerification = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
  
    if (enteredOtp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }
  
    try {
      const verifyResponse = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });
  
      const verifyData = await verifyResponse.json();
  
      if (verifyResponse.ok && verifyData.success) {
        alert("🎉 Email verified successfully! Welcome to CupidPlan.Me.");
      
        // ✅ Save user login so Home knows who they are
        localStorage.setItem("rememberedUser", email);
        sessionStorage.setItem("loggedInUser", email);
      
        navigate("/home");
      } else {
        alert(verifyData.message || "Invalid OTP. Try again.");
      }
    } catch (error) {
      console.error("❌ Error verifying OTP:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  

  // Handle Resend OTP
  const resendOtp = async () => {
    console.log("📩 Resend OTP clicked. Sending request..."); // Debugging log
  
    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      console.log("📨 OTP API Response:", data); // Log API response
  
      if (data.success) {
        alert("✅ OTP sent successfully! Check your email.");
        setResendDisabled(true);
        setCountdown(30);
  
        // Start Countdown Timer
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev === 1) {
              clearInterval(interval);
              setResendDisabled(false);
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        alert("❌ Failed to send OTP.");
      }
    } catch (error) {
      console.error("❌ Error sending OTP:", error);
      alert("Error sending OTP. Try again.");
    }
  };

  // Automatically enable resend button after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => setResendDisabled(false), 30000);
    console.log("📧 Email in use:", email); // Log email value
    return () => clearTimeout(timer);
  }, [email]);

  return (
    <div className="signup-container">
  {/* Header */}
  <header className="logo-container">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      {/* Group logo image + text in a flexbox */}
      <div className="logo-combo">
        <img src="/images/cupid-logo.png" alt="Cupid Logo" className="cupid-logo" />
        <div className="logo-text">CupidPlan.Me</div>
      </div>

      {/* Help Button */}
      <button className="signup-help-button" onClick={() => navigate("/help")}>
        Help
      </button>
    </div>
  </header>


      {/* Main Signup Form */}
      <main className="signup-main">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <>
            <h1 className="signup-title">Find Your Perfect Match – Create an Account</h1>
            <p className="signup-subtitle">Join a community of like-minded individuals.</p>

            <div className="signup-progress">
              <div className="progress-text"><span>Step 1 of 5</span><span>Basic Information</span></div>
              <div className="progress-bar"><div className="progress-bar-inner" style={{ width: "20%" }}></div></div>
            </div>

            <form onSubmit={nextStep} className="signup-form">
              <label>Full Name *</label>
              <input type="text" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />

              <label>Email *</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />

              <label>Phone Number (Optional)</label>
              <input type="tel" placeholder="Enter your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />

              <label>Password *</label>
              <input type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required />

              <label>Confirm Password *</label>
              <input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

              <div className="signup-buttons">
                <Link to="/" className="back-button">Back</Link>
                <button type="submit" className="next-button">Next Step</button>
              </div>
            </form>
          </>
        )}

        {/* Step 2: Profile Details */}
        {step === 2 && (
          <>
            <h1 className="signup-title">Complete Your Profile</h1>
            <p className="signup-subtitle">Tell us more about yourself.</p>

            <div className="signup-progress">
              <div className="progress-text"><span>Step 2 of 5</span><span>Profile Details</span></div>
              <div className="progress-bar"><div className="progress-bar-inner" style={{ width: "40%" }}></div></div>
            </div>

            <form onSubmit={nextStep} className="signup-form">
              <label>Profile Picture</label>
              <div className="profile-upload">
                <div className="upload-box">
                  {profilePicture ? <img src={URL.createObjectURL(profilePicture)} alt="Profile" className="uploaded-image" /> : <i className="fa-regular fa-user upload-icon"></i>}
                </div>
                <input type="file" accept="image/*" onChange={handleProfilePictureChange} id="upload-file" className="file-input" />
                <label htmlFor="upload-file" className="upload-button">Upload Photo</label>
                <p className="upload-note">Maximum size: 5MB. Supported formats: JPG, PNG</p>
              </div>

              <label>Date of Birth *</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />

              <label>Gender *</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-say">Prefer not to say</option>
              </select>

              <label>Interested In *</label>
              <select value={interestedIn} onChange={(e) => setInterestedIn(e.target.value)} required>
                <option value="">Select preference</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="everyone">Everyone</option>
              </select>

              
              {/* Replace this part in Step 2 of Signup */}
              <label>Location *</label>
<input
  ref={locationInputRef}
  type="text"
  placeholder="Enter your address"
  value={location}
  onChange={(e) => setLocation(e.target.value)}
  className="place-autocomplete-input"
  required
/>








              <label>About Me</label>
              <textarea placeholder="Tell us a little about yourself..." value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} maxLength={250}></textarea>

              <div className="signup-buttons">
                <button type="button" className="back-button" onClick={prevStep}>Back</button>
                <button type="submit" className="next-button">Next Step</button>
              </div>
            </form>
          </>
        )}

        {/* Step 3: Preferences & Compatibility */}
        {step === 3 && (
          <>
            <h1 className="signup-title">Set Your Preferences</h1>
            <p className="signup-subtitle">Tell us what you're looking for in a match.</p>

            <div className="signup-progress">
              <div className="progress-text"><span>Step 3 of 5</span><span>Preferences & Compatibility</span></div>
              <div className="progress-bar"><div className="progress-bar-inner" style={{ width: "60%" }}></div></div>
            </div>

            <form onSubmit={nextStep} className="signup-form">
              {/* Relationship Goals */}
              <label>Relationship Goals *</label>
              <select value={relationshipGoal} onChange={(e) => setRelationshipGoal(e.target.value)} required>
                <option value="">Select your goal</option>
                <option value="casual">Casual Dating</option>
                <option value="serious">Serious Relationship</option>
                <option value="friendship">Friendship</option>
                <option value="not-sure">Not Sure Yet</option>
              </select>

              {/* Hobbies & Interests */}
              <label>Hobbies & Interests</label>
              <div className="checkbox-container">
                {["Sports", "Music", "Travel", "Books", "Gaming", "Movies", "Cooking", "Fitness", "Dancing", "Art", "Theater", "Technology", "Photography", "Fashion", "Volunteering"].map((hobby) => (
                  <label key={hobby} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={hobbies.includes(hobby)}
                      onChange={() => setHobbies(hobbies.includes(hobby) ? hobbies.filter((h) => h !== hobby) : [...hobbies, hobby])}
                    />
                    {hobby}
                  </label>
                ))}
              </div>

              {/* Add More Hobbies */}
              <input
                type="text"
                placeholder="Add more hobbies..."
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newHobby.trim() !== "") {
                    e.preventDefault();
                    setHobbies([...hobbies, newHobby.trim()]);
                    setNewHobby(""); // Clear input
                  }
                }}
              />
              <div className="selected-items">
  {hobbies.map((hobby, index) => (
    <span 
      key={index} 
      className="selected-item"
      onClick={() => setHobbies(hobbies.filter((h) => h !== hobby))}
    >
      {hobby}
    </span>
  ))}
</div>


              {/* Dealbreakers */}
              <label>Dealbreakers</label>
              <div className="checkbox-container">
                {["Smoking", "Drinking", "Pets", "Long Distance", "Religion", "Diet Preferences", "Political Views", "Workaholic", "Messiness", "Jealousy", "Insecurity", "Lack of Ambition", "Different Interests", "Clinginess", "Laziness"].map((dealbreaker) => (
                  <label key={dealbreaker} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={dealbreakers.includes(dealbreaker)}
                      onChange={() => setDealbreakers(dealbreakers.includes(dealbreaker) ? dealbreakers.filter((d) => d !== dealbreaker) : [...dealbreakers, dealbreaker])}
                    />
                    {dealbreaker}
                  </label>
                ))}
              </div>

              {/* Add More Dealbreakers */}
              <input
                type="text"
                placeholder="Add more dealbreakers..."
                value={newDealbreaker}
                onChange={(e) => setNewDealbreaker(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newDealbreaker.trim() !== "") {
                    e.preventDefault();
                    setDealbreakers([...dealbreakers, newDealbreaker.trim()]);
                    setNewDealbreaker(""); // Clear input
                  }
                }}
              />
              <div className="selected-items">
  {dealbreakers.map((dealbreaker, index) => (
    <span 
      key={index} 
      className="selected-item"
      onClick={() => setDealbreakers(dealbreakers.filter((d) => d !== dealbreaker))}
    >
      {dealbreaker}
    </span>
  ))}
</div>
              <div className="signup-buttons">
                <button type="button" className="back-button" onClick={prevStep}>Back</button>
                <button type="submit" className="next-button">Next Step</button>
              </div>
            </form>
          </>
        )}

        {/* Step 4: Terms & Conditions */}
{step === 4 && (
  <>
    <h1 className="signup-title">Terms & Conditions</h1>
    <p className="signup-subtitle">Please review and accept our terms before proceeding.</p>

    <div className="signup-progress">
      <div className="progress-text"><span>Step 4 of 5</span><span>Account Setup</span></div>
      <div className="progress-bar"><div className="progress-bar-inner" style={{ width: "80%" }}></div></div>
    </div>

    <form onSubmit={nextStep} className="signup-form">
      {/* Terms & Conditions Box */}
      <div className="terms-box">
        <h2 className="text-xl mb-4">Terms & Conditions</h2>
        <div className="terms-content">
          <p>Welcome to CupidPlan.Me! By creating an account and using our services, you agree to comply with the following Terms & Conditions. Please read them carefully before proceeding.</p>

          <h3 className="mt-4">1. User Eligibility</h3>
          <p>You must be at least 18 years old to create an account on CupidPlan.Me. By signing up, you confirm that you meet this requirement.</p>

          <h3 className="mt-4">2. Account Security</h3>
          <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity that occurs under your account is your responsibility.</p>

          <h3 className="mt-4">3. Acceptable Use</h3>
          <p>By using CupidPlan.Me, you agree to engage respectfully with other users. Any abusive, harassing, or fraudulent behavior may result in account suspension or termination.</p>

          <h3 className="mt-4">4. Privacy & Data Protection</h3>
          <p>Your privacy is important to us. We collect and process your data in accordance with our <span className="underline">Privacy Policy</span>. We do not share your personal information with third parties without your consent.</p>

          <h3 className="mt-4">5. Termination of Service</h3>
          <p>We reserve the right to terminate or suspend your account at any time if you violate these terms or engage in harmful behavior.</p>

          <h3 className="mt-4">6. Limitation of Liability</h3>
          <p>CupidPlan.Me is not responsible for any damages or harm resulting from user interactions on our platform. Users are encouraged to practice caution when engaging with others.</p>

          <h3 className="mt-4">7. Changes to Terms</h3>
          <p>We may update these Terms & Conditions periodically. You will be notified of any significant changes.</p>
        </div>

        <label className="checkbox-label">
          
          <span>I agree to the <span className="underline">Terms & Conditions</span> and <span className="underline">Privacy Policy</span> *</span>
          <input type="checkbox" name="termsCheckbox" required />
        </label>
      </div>

      {/* Optional Subscription */}
      <div className="terms-box">
        <label className="checkbox-label">
          
          <span>I want to receive updates and special offers from CupidPlan.Me</span>
          <input type="checkbox" name="termsCheckbox" required />
        </label>
      </div>

      {/* Privacy Note */}
      <div className="privacy-box">
        <i className="fa-solid fa-shield-halved text-2xl"></i>
        <div>
          <h3>Your Privacy Matters</h3>
          <p className="text-sm">We take your privacy seriously. Your data is secure with us.</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="signup-buttons">
        <button type="button" className="back-button" onClick={prevStep}>Back</button>
        <button type="submit" className="next-button">Next Step</button>
      </div>
    </form>
  </>
)}

{/* Step 5: Email Verification (Final Step) */}
{step === 5 && (
          <>
            <h1 className="signup-title">Almost There!</h1>
            <p className="signup-subtitle">Please verify your email to complete your registration.</p>

            <form onSubmit={handleVerification} className="signup-form">
              <div className="verification-box">
                <i className="fa-regular fa-envelope text-4xl text-neutral-600 mb-4"></i>
                <h2 className="text-xl mb-2">Check Your Email</h2>
                <p className="text-neutral-600">We've sent a 6-digit code to **{email}**</p>
              </div>

              <div className="otp-container">
                {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  id={`otp-${index}`} // ✅ Ensures correct ID
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  className="otp-input"
              />
            ))}
          </div>


              <div className="text-center">
                <button type="button" className="resend-button" onClick={resendOtp} disabled={resendDisabled}>
                  <i className="fa-solid fa-rotate-right mr-2"></i>Resend Code
                </button>
                <p className="text-sm text-neutral-500 mt-2">You can resend code in {countdown} seconds</p>
              </div>

              <div className="signup-buttons">
                <button type="button" className="back-button" onClick={prevStep}>Back</button>
                <button type="submit" className="next-button">Verify & Complete</button>
              </div>
            </form>
          </>
        )}

      </main>
    </div>
  );
};

export default Signup;