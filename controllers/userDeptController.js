const Users = require("../models/users");
const Department = require("../models/department");

// assign a department to a user
exports.assignDepartment = async (req, res) => {
  try {
    const { userId, departmentId } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) return res.status(404).json({ message: "Department not found" });

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.department = departmentId;
    await user.save();

    res.json({ message: "Department assigned successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get all users with their departments
exports.getUserDepartments = async (req, res) => {
  try {
    const users = await Users.find().populate("department");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update a user's department
exports.updateUserDepartment = async (req, res) => {
  try {
    const { userId, departmentId } = req.body;

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const department = await Department.findById(departmentId);
    if (!department) return res.status(404).json({ message: "Department not found" });

    user.department = departmentId;
    await user.save();

    res.json({ message: "User department updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// remove a user's department assignment
exports.removeUserDepartment = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.department = null;
    await user.save();

    res.json({ message: "User removed from department", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
