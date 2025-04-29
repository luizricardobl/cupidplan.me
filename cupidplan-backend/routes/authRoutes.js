const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch"); // ✅ Used for Geocoding API
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Store OTPs temporarily
let otpStorage = {};

// 🔑 Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyC4gwNf8YgwW08UYEBjRkT-S08EBbStkp4";

// 🔹 1. User Signup & Save in Database
router.post("/signup", async (req, res) => {
  try {
    console.log("📩 Signup request received:", req.body);

    const {
      name,
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
    } = req.body;

    if (!name || !email || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    console.log("🔎 Checking if user exists...");
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    console.log("🔒 Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Get geo-coordinates from Google Geocoding API
    let coordinates = [0, 0]; // Default
    try {
      const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_MAPS_API_KEY}`);
      const geoData = await geoRes.json();

      if (
        geoData.status === "OK" &&
        geoData.results &&
        geoData.results[0] &&
        geoData.results[0].geometry
      ) {
        const { lat, lng } = geoData.results[0].geometry.location;
        coordinates = [lng, lat]; // GeoJSON format
      }
    } catch (geoError) {
      console.error("🌐 Geocoding failed:", geoError.message);
    }

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
      geoLocation: {
        type: "Point",
        coordinates,
      },
      aboutMe,
      relationshipGoal,
      hobbies,
      dealbreakers,
      verified: false,
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
    console.log("📩 Send OTP requested for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage[email] = otp;
    console.log("✅ OTP Generated:", otp);

    const msg = {
      to: email,
      from: "cupidplan42@gmail.com",
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

    if (otpStorage[email] !== otp) {
      console.log("❌ Invalid OTP");
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { verified: true },
      { new: true }
    );

    delete otpStorage[email];

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ OTP verified and token generated");
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token, 
    });

  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
});

module.exports = router;

