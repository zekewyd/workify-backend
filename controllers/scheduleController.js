const Schedule = require("../models/schedule");
const PersonalInfo = require("../models/personalInfo");

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
      selectedEmployees // array of employees
    } = req.body;

    // validate employee IDs against PersonalInfo
    const employees = await PersonalInfo.find({
      _id: { $in: selectedEmployees }
    }).select("_id");

    if (employees.length !== selectedEmployees.length) {
      return res.status(400).json({
        error: "One or more selected employees are invalid"
      });
    }

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
      employees: employees.map(e => e._id) // only valid IDs stored
    });

    const saved = await newSchedule.save();

    // populate employees with user + dept
    await saved.populate({
      path: "employees",
      select: "employeeNo firstName lastName userID",
      populate: {
        path: "userID",
        select: "jobTitle department",
        populate: { path: "department", select: "departmentName" }
      }
    });

    // transform to clean JSON format 
    const formattedSchedule = {
      _id: saved._id,
      scheduleName: saved.scheduleName,
      scheduleDescription: saved.scheduleDescription,
      startDate: saved.startDate,
      endDate: saved.endDate,
      scheduleType: saved.scheduleType,
      workDays: saved.workDays,
      workStart: saved.workStart,
      workEnd: saved.workEnd,
      latenessGrace: saved.latenessGrace,
      absenceGrace: saved.absenceGrace,
      createdBy: saved.createdBy,
      employees: saved.employees.map(emp => ({
        _id: emp._id,
        employeeNo: emp.employeeNo,
        firstName: emp.firstName,
        lastName: emp.lastName,
        jobTitle: emp.userID?.jobTitle || null,
        department: emp.userID?.department?.departmentName || null
      }))
    };

    res.status(201).json({
      message: "Schedule created successfully",
      schedule: formattedSchedule
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
      .populate({
        path: "employees",
        select: "pInfoID employeeNo firstName lastName userID",
        populate: {
          path: "userID",
          select: "email jobTitle department",
          populate: { path: "department", select: "departmentName" }
        }
      })
      .lean();

    const cleaned = schedules.map(sch => ({
      ...sch,
      employees: sch.employees.map(emp => ({
        _id: emp._id,
        pInfoID: emp.pInfoID,
        employeeNo: emp.employeeNo,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.userID?.email || "",
        jobTitle: emp.userID?.jobTitle || "",
        department: emp.userID?.department?.departmentName || ""
      }))
    }));

    res.json(cleaned);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json({ error: "Server error" });
  }
};
