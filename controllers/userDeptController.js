const Users = require("../models/users");
const Department = require("../models/department");

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
