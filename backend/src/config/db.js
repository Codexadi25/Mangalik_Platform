const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Establishes a hardened connection to MongoDB (Atlas or self-hosted).
 * - Connection pooling tuned for production load
 * - Fails fast in production if DB is unreachable (process exits so
 *   the orchestrator / PM2 can restart the container)
 */
const connectDB = async () => {
  const uri =
    process.env.NODE_ENV === "test"
      ? process.env.MONGO_URI_TEST
      : process.env.MONGO_URI;

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(uri, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV !== "production",
    });

    logger.info(`MongoDB connected → ${mongoose.connection.host}`);

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting reconnect...");
    });
  } catch (err) {
    logger.error(`MongoDB initial connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
