const mongoose = require("mongoose");

const SwipeSchema = new mongoose.Schema({
  swiperEmail: { type: String, required: true },
  swipeeEmail: { type: String, required: true },
  direction: { type: String, enum: ["left", "right"], required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Swipe", SwipeSchema);
