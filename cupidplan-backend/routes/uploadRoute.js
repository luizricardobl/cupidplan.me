const express = require("express");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../cloudinary");
const authenticate = require("../middleware/auth");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-profile-pic", authenticate, upload.single("image"), async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id);

    // Delete old image if exists
    if (user.profilePicPublicId) {
      await cloudinary.uploader.destroy(user.profilePicPublicId);
    }

    const bufferStream = streamifier.createReadStream(req.file.buffer);

    const stream = cloudinary.uploader.upload_stream(
      { folder: "cupidplan/profile_pics" },
      async (error, result) => {
        if (error) return res.status(500).json({ success: false, message: "Upload failed", error });

        user.profilePicUrl = result.secure_url;
        user.profilePicPublicId = result.public_id;
        await user.save();

        res.status(200).json({ success: true, url: result.secure_url });
      }
    );

    bufferStream.pipe(stream);
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ DELETE profile picture
router.delete("/delete-profile-pic", authenticate, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id);

    if (!user || !user.profilePicPublicId) {
      return res.status(404).json({ success: false, message: "No profile picture to delete" });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(user.profilePicPublicId);

    // Clear from database
    user.profilePicUrl = "";
    user.profilePicPublicId = "";
    await user.save();

    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting profile picture:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
