const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/users");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");

    // create default admin only if missing
    const adminEmail = "admin@example.com";
    const existingAdmin = await User.findOne({ email: adminEmail, role: "admin" });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "System Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        isDisabled: false,
        disabledAt: null,
        disabledBy: null,
      });
      console.log("System admin created");
    } else {
      console.log("System admin already exists, skipping creation");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
