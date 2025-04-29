const express = require("express");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../cloudinary");
const authenticate = require("../middleware/auth");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Upload Profile Picture
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

        // ✅ Save without validation to avoid crash from missing required fields
        await user.save({ validateBeforeSave: false });

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

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.profilePicPublicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicPublicId);
      } catch (cloudErr) {
        console.error("❌ Cloudinary deletion failed:", cloudErr);
        // Continue anyway
      }
    }

    user.profilePicUrl = "";
    user.profilePicPublicId = "";

    await user.save({ validateBeforeSave: false }); // ✅ skip validation

    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting profile picture:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ Upload Photo Album (NEW)
router.post("/photo-album", upload.array("photos", 10), async (req, res) => {
  try {
    const { email } = req.body;
    const files = req.files;

    if (!email || !files || files.length === 0) {
      return res.status(400).json({ error: "Missing email or files" });
    }

    const uploadedUrls = [];
    const User = require("../models/User");

    for (const file of files) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "CupidPlan/Album" },
        async (error, result) => {
          if (error) throw error;
          uploadedUrls.push(result.secure_url);

          if (uploadedUrls.length === files.length) {
            // Save all images to user's album
            const updatedUser = await User.findOneAndUpdate(
              { email },
              { $push: { album: { $each: uploadedUrls } } },
              { new: true }
            );

            return res.json({ success: true, album: updatedUser.album });
          }
        }
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    }
  } catch (err) {
    console.error("❌ Error uploading album:", err);
    res.status(500).json({ error: "Album upload failed" });
  }
});
// DELETE photo from album
router.delete("/photo-album/delete", authenticate, async (req, res) => {
  try {
    const { email, photoUrl } = req.body;
    if (!email || !photoUrl) {
      return res.status(400).json({ success: false, message: "Missing email or photoUrl" });
    }

    const User = require("../models/User");
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Extract public_id from URL
    const segments = photoUrl.split("/");
    const fileName = segments[segments.length - 1];
    const publicId = `cupidplan/album/${fileName.split(".")[0]}`;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Remove from user's album array
    user.album = user.album.filter((url) => url !== photoUrl);
    await user.save();

    return res.json({ success: true, message: "Photo deleted" });
  } catch (err) {
    console.error("❌ Error deleting album photo:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;

