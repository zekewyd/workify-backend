const Users = require("../models/users");
const Department = require("../models/department");

// assign a department to a user
exports.assignDepartment = async (req, res) => {
  try {
    const { userId, departmentId, jobTitle } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) return res.status(404).json({ message: "Department not found" });

    // require jobTitle and validate it belongs to the department
    if (!jobTitle) {
      return res.status(400).json({ message: "Job title is required" });
    }
    if (!Array.isArray(department.jobTitles) || !department.jobTitles.includes(jobTitle)) {
      return res.status(400).json({ message: "Selected job title is not in this department" });
    }

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.department = departmentId;
    user.jobTitle = jobTitle; 
    await user.save();

    const populated = await Users.findById(user._id)
      .populate("department", "departmentName jobTitles");

    res.json({ message: "Department assigned successfully", user: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get all emp with their departments
exports.getUserDepartments = async (req, res) => {
  try {
    const users = await Users.find({ 
      role: "employee", 
      department: { $ne: null } 
    }).populate("department");
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
