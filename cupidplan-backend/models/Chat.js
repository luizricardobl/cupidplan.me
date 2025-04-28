const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        read: {
          type: Boolean,
          default: false,
        },
        isDateSuggestion: {
          type: Boolean,
          default: false,
        },
        fullDateIdea: {
          type: String,
          default: null,
        },
      },
    ],
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("chat", ChatSchema);
