const TaskProgress = require("../models/taskProgress");
const Task = require("../models/task");

exports.logProgress = async (req, res) => {
  try {
    const progress = await TaskProgress.create({
      ...req.body,
      userID: req.user._id
    });
    res.status(201).json(progress);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

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
