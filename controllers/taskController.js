const Task = require("../models/task");
const Users = require("../models/users"); 
const PersonalInfo = require("../models/personalInfo");
const Department = require("../models/department"); 
const TaskProgress = require("../models/taskProgress");

function parseDueDate(input) {
  if (!input) return null;
  // if already a valid Date string (ISO), let Date parse it
  const iso = new Date(input);
  if (!isNaN(iso.getTime())) return iso;

  // accept mm/dd/yy or mm/dd/yyyy or mm-dd-yy
  const parts = String(input).trim().split(/[\/\-\.]/);
  if (parts.length === 3) {
    let mm = parseInt(parts[0], 10);
    let dd = parseInt(parts[1], 10);
    let yy = parseInt(parts[2], 10);
    if (isNaN(mm) || isNaN(dd) || isNaN(yy)) return null;
    // convert 2-digit year -> 2000+ 
    if (yy < 100) yy = 2000 + yy;
    // months in JS Date are 0-indexed
    return new Date(yy, mm - 1, dd);
  }
  return null;
}

// create tasks
exports.createTask = async (req, res) => {
  try {
    const { taskName, description, assignedTo, dueDate } = req.body;

    // basic validation
    if (!taskName || !description || !assignedTo || !dueDate) {
      return res.status(400).json({ message: "taskName, description, assignedTo, and dueDate are required" });
    }

    // verify assigned user exists and is employee
    const assignedUser = await Users.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({ message: "Assigned user not found" });
    }
    if (assignedUser.role !== "employee") {
      return res.status(400).json({ message: "assignedTo must be a user with role 'employee'" });
    }

    // auto-fill department
    const department = assignedUser.department || null;

    // parse due date
    const parsedDue = parseDueDate(dueDate);
    if (!parsedDue) {
      return res.status(400).json({ message: "Invalid dueDate format. Use mm/dd/yy, mm/dd/yyyy, or ISO format." });
    }

    // create the task
    const task = await Task.create({
      taskName,
      description,
      assignedTo,
      assignedBy: req.user._id, // fetch user details 
      department,
      dueDate: parsedDue,
      status: "in progress" // default status
    });

    // create matching progress record
    await TaskProgress.create({
      taskID: task._id,
      userID: assignedTo,
      hoursWorked: null,
      completionDate: null,
      progressStatus: "in progress"
    });

    // populate for response
    await task.populate([
      { path: "assignedTo", select: "username email" },
      { path: "assignedBy", select: "username role" },
      { path: "department", select: "departmentName jobTitle" }
    ]);

    res.status(201).json(task);

  } catch (err) {
    console.error("createTask error:", err);
    res.status(500).json({ message: err.message });
  }
};

// get tasks
exports.getTasks = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "employee") {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "username email department")
      .populate("assignedBy", "username role")
      .populate("department", "departmentName jobTitle")
      .lean(); 

    // fetch personal info for each user
    const userIds = tasks.map(t => t.assignedTo?._id).filter(Boolean);
    const personalInfos = await PersonalInfo.find({ userID: { $in: userIds } })
      .select("userID firstName lastName")
      .lean();

    // map userID to full name
    const userIdToFullName = {};
    personalInfos.forEach(info => {
      userIdToFullName[info.userID.toString()] = `${info.firstName} ${info.lastName}`.trim();
    });

    // display full name
    tasks.forEach(task => {
      const uid = task.assignedTo?._id?.toString();
      if (task.assignedTo && userIdToFullName[uid]) {
        task.assignedTo.fullName = userIdToFullName[uid];
      } else {
        task.assignedTo.fullName = task.assignedTo?.username || "";
      }
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update task (admin/HR only)
exports.updateTask = async (req, res) => {
  try {
    const { taskName, description, assignedTo, dueDate, status } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // update allowed fields
    if (taskName) task.taskName = taskName;
    if (description) task.description = description;
    if (status) task.status = status;

    // update task progress if status changed to completed
    if (status && status === "completed") {
      await TaskProgress.findOneAndUpdate(
        { taskID: task._id },
        { progressStatus: "completed" }
      );
    }

    // if assignedTo changes, auto-update department
    if (assignedTo && assignedTo.toString() !== task.assignedTo.toString()) {
      const assignedUser = await Users.findById(assignedTo);
      if (!assignedUser) return res.status(404).json({ message: "Assigned user not found" });
      if (assignedUser.role !== "employee") return res.status(400).json({ message: "assignedTo must be a user with role 'employee'" });
      task.assignedTo = assignedTo;
      task.department = assignedUser.department || null;
    }

    // if dueDate provided, parse it
    if (dueDate) {
      const parsedDue = parseDueDate(dueDate);
      if (!parsedDue) return res.status(400).json({ message: "Invalid dueDate format" });
      task.dueDate = parsedDue;
    }

    await task.save();

    // populate before returning
    await task.populate([
      { path: "assignedTo", select: "username email" },
      { path: "assignedBy", select: "username role" },
      { path: "department", select: "departmentName jobTitle" }
    ]);

    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// delete task (admin/HR only)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // delete all related progress logs for this task
    await TaskProgress.deleteMany({ taskID: task._id });

    res.json({ message: "Task and related progress logs deleted" });
  } catch (err) {
    console.error("deleteTask error:", err);
    res.status(500).json({ message: err.message });
  }
};
