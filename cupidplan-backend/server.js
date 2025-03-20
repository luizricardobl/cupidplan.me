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

// ✅ API Route to Send OTP
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // ✅ Generate a new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStorage[email] = otp; // Store OTP in memory

  console.log(`Generated OTP for ${email}: ${otp}`); // Debugging log

  const msg = {
    to: email,
    from: process.env.EMAIL_SENDER,
    subject: "Your CupidPlan.Me OTP Code",
    text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await sgMail.send(msg);
    res.json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Error sending OTP" });
  }
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
