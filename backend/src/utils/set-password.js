require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User.model");

const run = async () => {
  await connectDB();
  const superadminEmail = process.env.SUPERADMIN_MASTER_EMAIL || "owner@adityatechndevoops.in";
  
  const superadmin = await User.findOne({ email: superadminEmail });
  if (superadmin) {
    superadmin.password = "admin123";
    await superadmin.save();
    console.log("Password updated successfully.");
  } else {
    console.log("Superadmin not found.");
  }
  
  await mongoose.disconnect();
  process.exit(0);
};

run();
