const AttendanceLog = require("../models/attendanceLog");
const Users = require("../models/users"); 
const PersonalInfo = require("../models/personalInfo"); 

// calculate hours
function calculateHours(clockIn, clockOut) {
  if (clockIn === '--' || clockOut === '--' || !clockIn || !clockOut) {
    return { totalHrs: 0, overtime: 0 };
  }
  const startTime = new Date(`2024-01-01 ${clockIn}`);
  const endTime = new Date(`2024-01-01 ${clockOut}`);
  const totalHours = (endTime - startTime) / (1000 * 60 * 60);
  return {
    totalHrs: Math.max(totalHours, 0),
    overtime: Math.max(totalHours - 8, 0)
  };
}

// create attendance log
exports.addLog = async (req, res) => {
  try {
    const { employee, date, status, clockIn, clockOut } = req.body;

    if (!employee || !date || !status) {
      return res.status(400).json({ message: "employee, date, and status are required" });
    }

    // find user and auto-populate department
    const user = await Users.findById(employee).populate("department", "departmentName");
    if (!user) return res.status(404).json({ message: "Employee not found" });
    if (user.role !== "employee") return res.status(400).json({ message: "User must have role 'employee'" });

    // find PersonalInfo for first/last name
    const pInfo = await PersonalInfo.findOne({ userID: employee });
    if (!pInfo) return res.status(404).json({ message: "PersonalInfo not found for user" });
    const employeeName = `${pInfo.firstName} ${pInfo.lastName}`.trim();

    const departmentName = user.department?.departmentName || "";

    // calculate hours
    const { totalHrs, overtime } = calculateHours(clockIn, clockOut);

    // create attendance log
    const log = await AttendanceLog.create({
      employee,
      employeeName,
      department: departmentName,
      date,
      clockIn,
      clockOut,
      status,
      totalHrs,
      overtime
    });

    res.status(201).json(log);
  } catch (err) {
    console.error("createAttendanceLog error:", err);
    res.status(500).json({ message: err.message });
  }
};

// update attendance log (admin/hr)
exports.updateLog = async (req, res) => {
  try {
    const { clockIn, clockOut, status } = req.body;
    const log = await AttendanceLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Attendance log not found" });

    if (clockIn !== undefined) log.clockIn = clockIn;
    if (clockOut !== undefined) log.clockOut = clockOut;
    if (status !== undefined) log.status = status;

    // recalculate hours
    const { totalHrs, overtime } = calculateHours(log.clockIn, log.clockOut);
    log.totalHrs = totalHrs;
    log.overtime = overtime;

    await log.save();
    res.json(log);
  } catch (err) {
    console.error("updateAttendanceLog error:", err);
    res.status(400).json({ message: err.message });
  }
};

// get logs (admin/hr: all, employee: only own)
exports.getLogs = async (req, res) => {
  try {
    const { role, _id } = req.user; // injected by verifyToken middleware

    let filter = {};
    if (role === "employee") {
      filter.employee = _id;
    } else {
      // admin/hr can filter by department/date
      if (req.query.department) filter.department = req.query.department;
      if (req.query.date) filter.date = req.query.date;
    }
    const logs = await AttendanceLog.find(filter).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// delete attendance log (admin/hr)
exports.deleteLog = async (req, res) => {
  try {
    const log = await AttendanceLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: "Attendance log not found" });
    res.json({ message: "Attendance log deleted" });
  } catch (err) {
    console.error("deleteAttendanceLog error:", err);
    res.status(500).json({ message: err.message });
  }
};