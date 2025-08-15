const TaskProgress = require("../models/taskProgress");
const Task = require("../models/task");
const PersonalInfo = require("../models/personalInfo");

// log progress
exports.logProgress = async (req, res) => {
  try {
    const { hoursWorked, completionDate } = req.body;
    if (hoursWorked == null || !completionDate) {
      return res.status(400).json({ message: "hoursWorked and completionDate are required" });
    }

    const progress = await TaskProgress.findOne({ 
      taskID: req.body.taskID, 
      userID: req.user._id 
    });
    if (!progress) return res.status(404).json({ message: "Progress record not found" });

    // employee can only edit these two fields
    progress.hoursWorked = hoursWorked;
    progress.completionDate = new Date(completionDate);
    progress.progressStatus = "pending";

    await progress.save();

    // update task status to pending
    await Task.findByIdAndUpdate(progress.taskID, { status: "pending" });

    res.json(progress);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// get progress logs
exports.getProgress = async (req, res) => {
  try {
    let progressLogs;
    if (req.user.role === "employee") {
      progressLogs = await TaskProgress.find({ userID: req.user._id }).populate("taskID userID");
    } else {
      progressLogs = await TaskProgress.find().populate("taskID userID");
    }
    res.json(progressLogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveProgress = async (req, res) => {
  try {
    const progress = await TaskProgress.findById(req.params.id);
    if (!progress) return res.status(404).json({ message: "Progress not found" });

    progress.progressStatus = "completed";
    progress.completionDate = new Date();
    await progress.save();

    await Task.findByIdAndUpdate(progress.taskID, { status: "approved" });

    res.json({ message: "Progress approved", progress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
