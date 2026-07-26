const mongoose = require("mongoose");

const networkMetricSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    reqs: {
      type: Number,
      default: 0,
    },
    avgLatency: {
      type: Number,
      default: 0,
    },
    errorCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: false,
  }
);

const NetworkMetric = mongoose.model("NetworkMetric", networkMetricSchema);

// Drop the old TTL index if it exists so we can keep historical data
mongoose.connection.once("open", async () => {
  try {
    const indexes = await NetworkMetric.collection.indexes();
    const hasTTL = indexes.find(i => i.name === "timestamp_1" && i.expireAfterSeconds !== undefined);
    if (hasTTL) {
      await NetworkMetric.collection.dropIndex("timestamp_1");
      console.log("Dropped TTL index on NetworkMetric to preserve historical data.");
    }
  } catch (err) {
    // Index might not exist or collection is empty, ignore
  }
});

module.exports = NetworkMetric;
