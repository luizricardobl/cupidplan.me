const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  profileImage: { type: String, default: "" },
  profilePicUrl: { type: String },
  profilePicPublicId: { type: String },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  interestedIn: { type: String, required: true },
  location: { type: String, required: true }, // Human-readable (e.g. "Boston, MA")
  geoLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  aboutMe: { type: String },
  relationshipGoal: { type: String, required: true },
  hobbies: [String],
  favoriteFood: [String],
  dealbreakers: [String],
  verified: { type: Boolean, default: false },

  
  minAge: { type: Number, default: 18 },
  maxAge: { type: Number, default: 99 },
  distance: { type: Number, default: 50 },

  
  types: {
    casual: { type: Boolean, default: false },
    romantic: { type: Boolean, default: false },
    adventurous: { type: Boolean, default: false },
  },

  hideProfile: {
    type: Boolean,
    default: false,
  },
  chatNotifications: {
    type: Boolean,
    default: false,
  },
  album: {
  type: [String], 
  default: [],
}


});


UserSchema.index({ geoLocation: "2dsphere" });

module.exports = mongoose.model("User", UserSchema);
