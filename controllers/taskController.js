const Task = require("../models/task");

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      assignedBy: req.user._id
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === "employee") {
      tasks = await Task.find({ assignedTo: req.user._id }).populate("assignedTo assignedBy department");
    } else {
      tasks = await Task.find().populate("assignedTo assignedBy department");
    }
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
