require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User.model.js");
const connectDB = require("./src/config/db");

const run = async () => {
  await connectDB();
  const email = "owner@adityatechndevoops.in";
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email, name: "Aditya Tech Team", role: "superadmin", authProvider: "password" });
  } else {
    user.role = "superadmin";
  }
  user.password = "AdityaTech@123!"; // The pre-save hook in User.model.js will automatically hash this
  await user.save();
  console.log("Superadmin account ensured for:", email);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
