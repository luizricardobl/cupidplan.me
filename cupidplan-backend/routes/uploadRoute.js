const express = require("express");
const multer = require("multer");
const cloudinary = require("../cloudinary");
const authenticate = require("../middleware/auth");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-profile-pic", authenticate, upload.single("image"), async (req, res) => {
  try {
    const bufferStream = require("streamifier").createReadStream(req.file.buffer);

    const stream = cloudinary.uploader.upload_stream(
      { folder: "cupidplan/profile_pics" },
      async (error, result) => {
        if (error) return res.status(500).json({ success: false, message: "Upload failed", error });

        // Save URL to user
        const User = require("../models/User");
        await User.findByIdAndUpdate(req.user.id, { profilePicUrl: result.secure_url });

        res.status(200).json({ success: true, url: result.secure_url });
      }
    );

    bufferStream.pipe(stream);
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/delete-profile-pic", authenticate, async (req, res) => {
    try {
      const User = require("../models/User");
      const user = await User.findById(req.user.id);
  
      if (!user || !user.profilePicUrl) {
        return res.status(404).json({ success: false, message: "No profile picture to delete" });
      }
  
      // Optional: Extract the public ID if you want to delete from Cloudinary too
      const publicId = user.profilePicUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`cupidplan/profile_pics/${publicId}`);
  
      // Remove from user model
      user.profilePicUrl = "";
      await user.save();
  
      res.json({ success: true, message: "Profile picture deleted" });
    } catch (err) {
      console.error("❌ Delete Error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  

module.exports = router;
