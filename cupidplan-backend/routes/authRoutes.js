const express = require("express");
const router = express.Router();
const User = require("../models/User");
 // Import User model
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Store OTPs temporarily
let otpStorage = {};

// 🔹 1. User Signup & Save in Database
router.post("/signup", async (req, res) => {
    try {
      console.log("📩 Signup request received:", req.body); // Log incoming request data
  
      const { name, email, phone, password, dob, gender, interestedIn, location, aboutMe, relationshipGoal, hobbies, dealbreakers } = req.body;

  
      if (!name || !email || !password) {
        console.log("❌ Missing required fields");
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }
  
      // Check if user already exists
      console.log("🔎 Checking if user exists...");
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("❌ User already exists:", email);
        return res.status(400).json({ success: false, message: "User already exists" });
      }
  
      // Hash password
      console.log("🔒 Hashing password...");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create user
      console.log("✅ Creating new user in database...");
      const newUser = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        dob,
        gender,
        interestedIn,
        location,
        aboutMe,
        relationshipGoal,
        hobbies,
        dealbreakers,
        verified: false, // Mark as unverified until OTP is confirmed
      });
  
      await newUser.save();
      console.log("🎉 User registered successfully!");
  
      res.status(201).json({ success: true, message: "User registered successfully" });
  
    } catch (error) {
      console.error("❌ Error signing up user:", error);
      res.status(500).json({ success: false, message: "Error signing up user", error: error.message });
    }
  });
  

// 🔹 2. Generate & Send OTP via Email
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📩 Send OTP requested for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage[email] = otp;
    console.log("✅ OTP Generated:", otp);

    const msg = {
      to: email,
      from: process.env.EMAIL_SENDER,
      subject: "CupidPlan.Me OTP Code",
      text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
    };

    await sgMail.send(msg);
    console.log("✅ OTP sent to email:", email);

    res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});


// 🔹 3. Verify OTP & Finalize Signup
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("📥 OTP verification request received:");
    console.log("Email:", email);
    console.log("OTP entered:", otp);
    console.log("OTP stored:", otpStorage[email]);

    // Check OTP
    if (otpStorage[email] !== otp) {
      console.log("❌ Invalid OTP");
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Mark user as verified
    await User.findOneAndUpdate({ email }, { verified: true });
    delete otpStorage[email]; // Remove OTP after verification

    console.log("✅ OTP verified successfully");
    res.status(200).json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
});


module.exports = router;
