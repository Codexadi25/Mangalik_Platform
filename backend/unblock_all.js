const mongoose = require("mongoose");
require("dotenv").config();

const DefenderBlock = require("./src/models/DefenderBlock.model");
const User = require("./src/models/User.model");

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not found in environment.");
    process.exit(1);
  }
  console.log("Connecting to database...");
  await mongoose.connect(uri);
  console.log("Connected successfully.");

  // Update all blocked defender records
  const defenderResult = await DefenderBlock.updateMany(
    { status: "blocked" },
    {
      $set: {
        status: "active",
        violationsCount: 0,
        graceIncrements: 0,
        graceUntil: null,
      }
    }
  );
  console.log(`Unblocked ${defenderResult.modifiedCount} Defender records.`);

  // Update all suspended users
  const userResult = await User.updateMany(
    { isSuspended: true },
    { $set: { isSuspended: false } }
  );
  console.log(`Unsuspended ${userResult.modifiedCount} users.`);

  await mongoose.connection.close();
  console.log("Database connection closed.");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
