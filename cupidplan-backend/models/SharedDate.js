const mongoose = require("mongoose");

const sharedDateSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
  sender: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: String, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SharedDate", sharedDateSchema);
