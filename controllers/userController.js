const bcrypt = require("bcryptjs");
const User = require("../models/users");

// admin only: create a user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = "employee", isVerified = false } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "name, email, password required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      isVerified,
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

    // Employee can only update their own profile
    if (caller.role === "employee" && caller.id !== id) {
      return res.status(403).json({ message: "Employees can only update their own profile" });
    }

    const updates = {};

    // name
    if (req.body.name) updates.name = req.body.name;

    // Email
    if (req.body.email) {
      if (caller.id === id) {
        updates.email = req.body.email; // always allow self-update
      } else if (caller.role === "admin" || caller.role === "hr") {
        updates.email = req.body.email; // admin/hr can change others' email if allowed
      } else {
        return res.status(403).json({ message: "Not allowed to change email" });
      }
    }

    // password
    if (req.body.password) {
      if (caller.id === id) {
        updates.password = await bcrypt.hash(req.body.password, 10); // self-update allowed
      } else if (caller.role === "admin") {
        updates.password = await bcrypt.hash(req.body.password, 10); // admin can change any password
      } else if (caller.role === "hr" && target.role === "employee") {
        updates.password = await bcrypt.hash(req.body.password, 10); // hr can change employee password
      } else {
        return res.status(403).json({ message: "Not allowed to change password" });
      }
    }

    // isVerified
    if (typeof req.body.isVerified !== "undefined") {
      if (caller.role === "admin") {
        updates.isVerified = !!req.body.isVerified;
      } else if (caller.role === "hr" && target.role === "employee") {
        updates.isVerified = !!req.body.isVerified;
      } else if (caller.id === id) {
        // self cannot verify themselves (security)
        return res.status(403).json({ message: "Cannot change your own verification status" });
      } else {
        return res.status(403).json({ message: "Not allowed to change verification" });
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
