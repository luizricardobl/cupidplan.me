// Debugging logs
console.log('Loading express...');
const express = require('express');
console.log('Loading mongoose...');
const mongoose = require('mongoose');
console.log('Loading cors...');
const cors = require('cors');
console.log('Loading dotenv...');
require('dotenv').config();
console.log('Loading nodemailer...');
const nodemailer = require('nodemailer');
const sgMail = require("@sendgrid/mail");
console.log('All modules loaded successfully.');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Store OTPs in memory (temporary storage)
const otpStorage = {}; // { email: otp }

// ✅ Configure Nodemailer for SendGrid
const transporter = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: "apikey", // Required for SendGrid
    pass: process.env.SENDGRID_API_KEY,
  },
});

// ✅ API Route to Verify OTP
app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  console.log(`Verifying OTP for ${email}: ${otp}`); // Debugging log

  // ✅ Check if OTP matches the stored one
  if (otpStorage[email] && otpStorage[email] == otp) {
    delete otpStorage[email]; // Remove OTP after successful login
    return res.json({ success: true, message: "OTP verified successfully!" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }
});

const dateRoutes = require("./routes/dates"); // 👈 Ensure this is correct
app.use("/api/dates", dateRoutes); // 👈 Ensure this is correct

const authRoutes = require("./routes/authRoutes"); 
app.use("/api/auth", authRoutes);

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
