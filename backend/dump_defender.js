const mongoose = require("mongoose");
require("dotenv").config();

const DefenderBlock = require("./src/models/DefenderBlock.model");

async function run() {
  const uri = process.env.MONGO_URI;
  await mongoose.connect(uri);
  const records = await DefenderBlock.find({});
  console.log("Total Defender records:", records.length);
  console.log(JSON.stringify(records, null, 2));
  await mongoose.connection.close();
}

run().catch(console.error);
