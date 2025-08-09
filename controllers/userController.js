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

// admin only: get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// admin or HR: get one user by id (HR cannot fetch admins)
exports.getUserById = async (req, res) => {
  try {
    const target = await User.findById(req.params.id).select("-password");
    if (!target) return res.status(404).json({ message: "User not found" });

    if (req.user.role === "hr" && target.role === "admin") {
      return res.status(403).json({ message: "Forbidden: HR cannot access admin data" });
    }

    res.json(target);
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

// Update user 
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const caller = req.user; // { id, role }

    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: "User not found" });

    if (caller.role === "hr" && target.role === "admin") {
      return res.status(403).json({ message: "HR cannot modify admin users" });
    }
    if (caller.role === "employee" && caller.id !== id) {
      return res.status(403).json({ message: "Employees can only update their own profile" });
    }

    const updates = {};
    if (req.body.name) updates.name = req.body.name;

    if (req.body.password) {
      if (caller.role === "employee" && caller.id !== id) {
        return res.status(403).json({ message: "Not allowed to change password" });
      }
      if (caller.role === "hr" && caller.id !== id) {
        return res.status(403).json({ message: "HR cannot change passwords" });
      }
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    if (typeof req.body.isVerified !== "undefined") {
      if (caller.role === "admin") {
        updates.isVerified = !!req.body.isVerified;
      } else if (caller.role === "hr") {
        if (target.role === "employee") updates.isVerified = !!req.body.isVerified;
        else return res.status(403).json({ message: "HR can only verify employees" });
      } else {
        return res.status(403).json({ message: "Not allowed to change verification" });
      }
    }

    if (typeof req.body.role !== "undefined") {
      if (caller.role !== "admin") return res.status(403).json({ message: "Only admin can change roles" });
      if (!["admin", "hr", "employee"].includes(req.body.role)) return res.status(400).json({ message: "Invalid role" });
      updates.role = req.body.role;
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
