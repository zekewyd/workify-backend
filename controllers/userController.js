const bcrypt = require("bcryptjs");
const User = require("../models/users");

// admin only: create a user
exports.createUser = async (req, res) => {
  try {
    let { username, email, password, role = "employee", isDisabled = false } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email, password required" });
    }

    if (password.length > 21) {
      return res.status(400).json({ message: "Password cannot exceed 21 characters" });
    }

    // username format check
    const usernameRegex = /^[a-z0-9._@!#$%^&*()\-\+=|[\]\\:'",?/]+$/i;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ message: "Username contains invalid characters" });
    }

    // check if username or email exists (case-insensitive)
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashed,
      role,
      isDisabled: false,
      disabledAt: null,
      disabledBy: null,
    });

    const out = user.toObject();
    delete out.password;
    res.status(201).json(out);

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// admin or HR: get allowed user list
exports.getAllUsers = async (req, res) => {
  try {
    let users;

    if (req.user.role === "admin") {
      // admin gets all users
      users = await User.find().select("-password");
    } 
    else if (req.user.role === "hr") {
      // HR gets employees only, excluding themselves
      users = await User.find({
        role: "employee",
        _id: { $ne: req.user.id }
      }).select("-password");
    } 
    else {
      return res.status(403).json({ message: "Forbidden: Only admin or HR can access this list" });
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// any authenticated user: get own profile
exports.getMe = async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select("-password");
    if (!me) return res.status(404).json({ message: "User not found" });
    res.json(me);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// update user
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const caller = req.user; // { id, role }

    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: "User not found" });

    // HR cannot update Admin accounts (except their own profile)
    if (caller.role === "hr" && target.role === "admin" && caller.id !== id) {
      return res.status(403).json({ message: "HR cannot modify admin users" });
    }

    // employee can only update their own profile
    if (caller.role === "employee" && caller.id !== id) {
      return res.status(403).json({ message: "Employees can only update their own profile" });
    }

    const updates = {};

    // username
    if (req.body.username) {
      const usernameRegex = /^[a-z0-9._@!#$%^&*()\-\+=|[\]\\:'",?/]+$/i;
      if (!usernameRegex.test(req.body.username)) {
        return res.status(400).json({ message: "Username contains invalid characters" });
      }

      const existingUser = await User.findOne({ username: req.body.username.toLowerCase(), _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      updates.username = req.body.username.toLowerCase();
    }

    // email
    if (req.body.email) {
      const existingEmail = await User.findOne({ email: req.body.email.toLowerCase(), _id: { $ne: id } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      if (caller.id === id || caller.role === "admin" || (caller.role === "hr" && target.role === "employee")) {
        updates.email = req.body.email.toLowerCase();
      } else {
        return res.status(403).json({ message: "Not allowed to change email" });
      }
    }

    // password
    if (req.body.password) {
      if (req.body.password.length > 21) {
        return res.status(400).json({ message: "Password cannot exceed 21 characters" });
      }

      if (caller.id === id || caller.role === "admin" || (caller.role === "hr" && target.role === "employee")) {
        updates.password = await bcrypt.hash(req.body.password, 10);
      } else {
        return res.status(403).json({ message: "Not allowed to change password" });
      }
    }

    // role change
    if (typeof req.body.role !== "undefined") {
      if (caller.role !== "admin") return res.status(403).json({ message: "Only admin can change roles" });
      if (!["admin", "hr", "employee"].includes(req.body.role)) return res.status(400).json({ message: "Invalid role" });
      updates.role = req.body.role;
    }

    // isDisabled
    if (typeof req.body.isDisabled !== "undefined") {
      if (caller.role !== "admin") return res.status(403).json({ message: "Only admin can disable/enable users" });
      updates.isDisabled = !!req.body.isDisabled;
      updates.disabledAt = updates.isDisabled ? new Date() : null;
      updates.disabledBy = updates.isDisabled ? caller.id : null;
    }

    const updated = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// disable user
exports.disableUser = async (req, res) => {
  try {
    const id = req.params.id;
    const caller = req.user;

    if (caller.id === id) {
      return res.status(400).json({ message: "You cannot disable your own account" });
    }

    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: "User not found" });

    if (caller.role === "hr" && target.role !== "employee") {
      return res.status(403).json({ message: "HR can only disable employees" });
    }

    target.isDisabled = true;
    target.disabledAt = new Date();
    target.disabledBy = caller.id;
    await target.save();

    res.json({ message: "User disabled (soft-delete)", userId: id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
