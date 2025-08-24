const Schedule = require("../models/schedule");

// create schedule
exports.createSchedule = async (req, res) => {
  try {
    const {
      scheduleName,
      scheduleDescription,
      startDate,
      endDate,
      scheduleType,
      workDays,
      workStart,
      workEnd,
      latenessGrace,
      absenceGrace,
      selectedEmployees // array of employee IDs from /emp-info/all
    } = req.body;

    const newSchedule = new Schedule({
      scheduleName,
      scheduleDescription,
      startDate,
      endDate,
      scheduleType,
      workDays,
      workStart,
      workEnd,
      latenessGrace,
      absenceGrace,
      createdBy: req.user?._id || null,
      employees: selectedEmployees
    });

    const saved = await newSchedule.save();

    res.status(201).json({
      message: "Schedule created successfully",
      schedule: saved
    });
  } catch (err) {
    console.error("Error creating schedule:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// get schedules
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("employees", "firstName lastName department jobTitle email") // populate existing employees
      .lean();

    res.json(schedules);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json({ error: "Server error" });
  }
};
