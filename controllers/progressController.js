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

    console.log("req.user._id:", req.user._id);
    console.log("taskID from body:", req.body.taskID);
    const progress = await TaskProgress.findOne({ 
      taskID: req.body.taskID, 
      userID: req.user._id 
    });

    console.log("Found progress:", progress);
    
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
      progressLogs = await TaskProgress.find({ userID: req.user._id }).populate("taskID userID").lean();
    } else {
      progressLogs = await TaskProgress.find().populate("taskID userID").lean();
    }

    // get all emp
    const userIds = progressLogs.map(log => log.userID?._id).filter(Boolean);

    // fetch personal info for those users
    const personalInfos = await PersonalInfo.find({ userID: { $in: userIds } })
      .select("userID firstName lastName")
      .lean();

    // map userID to full name
    const userIdToName = {};
    personalInfos.forEach(info => {
      userIdToName[info.userID.toString()] = `${info.firstName} ${info.lastName}`.trim();
    });

    // display full name
    progressLogs.forEach(log => {
      if (log.userID && userIdToName[log.userID._id.toString()]) {
        log.userID.firstName = personalInfos.find(
          info => info.userID.toString() === log.userID._id.toString()
        )?.firstName || '';
        log.userID.lastName = personalInfos.find(
          info => info.userID.toString() === log.userID._id.toString()
        )?.lastName || '';
        log.userID.fullName = userIdToName[log.userID._id.toString()];
      } else {
        log.userID.firstName = "";
        log.userID.lastName = "";
        log.userID.fullName = log.userID?.username || "";
      }
    });

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
