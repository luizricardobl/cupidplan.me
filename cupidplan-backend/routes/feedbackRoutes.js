const express = require("express");
const router = express.Router();
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post("/submit", async (req, res) => {
    const { name, rating, comment, emoji, category, recommend } = req.body;


  const email = {
    to: "cupidplan42@gmail.com",     
    from: "cupidplan42@gmail.com",   
    subject: `💌 New Testimonial from ${name}`,
    text: `
📝 New Testimonial Received

Name: ${name}
Rating: ${rating} stars
Category: ${category}
Recommend: ${recommend}
Emoji: ${emoji || "None"}

Comment:
${comment}
`,
  };

  try {
    await sgMail.send(email);
    res.status(200).json({ success: true, message: "Feedback sent via SendGrid!" });
  } catch (error) {
    console.error("❌ SendGrid error:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});
console.log("📦 Loaded SendGrid Key:", process.env.SENDGRID_API_KEY ? "✅ Found" : "❌ Not Found");

module.exports = router;
