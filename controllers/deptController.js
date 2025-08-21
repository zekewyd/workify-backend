const Department = require("../models/department");

// create a new department
exports.createDepartment = async (req, res) => {
  try {
    const { departmentName, jobTitles } = req.body;

    if (!departmentName || !Array.isArray(jobTitles) || jobTitles.length === 0) {
      return res.status(400).json({ message: "Department name and job titles are required" });
    }

    const department = await Department.create({
      departmentName,
      jobTitles
    });

    res.status(201).json(department);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update a department
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json(department);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// delete a department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
