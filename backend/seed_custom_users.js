require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const User = require("./src/models/User.model");

const run = async () => {
  await connectDB();

  // 1. Customer User
  const customerEmail = "creedracer111@gmail.com";
  let customer = await User.findOne({ email: customerEmail });
  if (!customer) {
    customer = new User({
      name: "Creed Racer",
      email: customerEmail,
      role: "user",
      authProvider: "password"
    });
  } else {
    customer.role = "user";
  }
  customer.password = "asdfghjkl";
  await customer.save();
  console.log("✔ Customer account ensured for:", customerEmail);

  // 2. Admin User
  const adminEmail = "rahul.dhanlaxmienterprises@gmail.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({
      name: "Rahul Dhanlaxmi Admin",
      email: adminEmail,
      role: "admin",
      authProvider: "password"
    });
  } else {
    admin.role = "admin";
  }
  admin.password = "asdfghjkl";
  await admin.save();
  console.log("✔ Admin account ensured for:", adminEmail);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
