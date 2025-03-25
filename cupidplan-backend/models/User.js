const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  interestedIn: { type: String, required: true },
  location: { type: String, required: true },
  aboutMe: { type: String },
  relationshipGoal: { type: String, required: true },
  hobbies: [String],
  dealbreakers: [String],
  verified: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", UserSchema);
