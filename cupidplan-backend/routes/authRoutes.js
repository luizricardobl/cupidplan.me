const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import User model
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Store OTPs temporarily
let otpStorage = {};

// 🔹 1. User Signup & Save in Database
router.post("/signup", async (req, res) => {
    try {
      console.log("📩 Signup request received:", req.body); // Log incoming request data
  
      const { fullName, email, phone, password, dob, gender, interestedIn, location, aboutMe, relationshipGoal, hobbies, dealbreakers } = req.body;
  
      if (!fullName || !email || !password || !dob || !gender || !interestedIn || !location || !relationshipGoal) {
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
        fullName,
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
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage[email] = otp; // Store OTP temporarily

    // Send OTP via Email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_SENDER, // Use your email from .env
        pass: process.env.EMAIL_PASSWORD, // Use your email password from .env
      },
    });

    await transporter.sendMail({
      from: "no-reply@cupidplan.com",
      to: email,
      subject: "Your CupidPlan.Me OTP",
      text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
    });

    res.status(200).json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error sending OTP" });
  }
});

// 🔹 3. Verify OTP & Finalize Signup
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check OTP
    if (otpStorage[email] !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Mark user as verified
    await User.findOneAndUpdate({ email }, { verified: true });
    delete otpStorage[email]; // Remove OTP after verification

    res.status(200).json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
});

module.exports = router;
