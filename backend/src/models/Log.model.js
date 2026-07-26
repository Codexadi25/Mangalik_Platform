const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    // Capped collections or TTL could be used here if needed for auto-cleanup.
    // Setting expireAfterSeconds will auto-delete logs older than 30 days (2592000s)
    expireAfterSeconds: 2592000,
  }
);

module.exports = mongoose.model("Log", logSchema);
