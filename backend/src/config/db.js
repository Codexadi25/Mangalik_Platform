const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Establishes a connection to MongoDB Atlas using MONGO_URI from the environment.
 *
 * No fallback — if the URI is missing or Atlas is unreachable the process
 * exits immediately so the issue is visible rather than silently degrading
 * to a local database.
 */
const connectDB = async () => {
  const uri =
    process.env.NODE_ENV === "test"
      ? process.env.MONGO_URI_TEST
      : process.env.MONGO_URI;

  if (!uri) {
    logger.error(
      "MONGO_URI is not defined in the environment. " +
      "Add it to your .env file and restart the server."
    );
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(uri, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV !== "production",
    });

    // Log the actual Atlas host (e.g. cluster0-shard-00-00.bm9wmnx.mongodb.net)
    // so you can confirm it is NOT 127.0.0.1.
    logger.info(`MongoDB connected → ${mongoose.connection.host}`);

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB runtime error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Mongoose will auto-reconnect…");
    });
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    logger.error(
      "Check that MONGO_URI in .env is correct, your IP is whitelisted " +
      "in Atlas Network Access, and the cluster is not paused."
    );
    process.exit(1);
  }
};

module.exports = connectDB;
