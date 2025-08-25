const mongoose = require("mongoose");

const attendanceLogSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  employeeName: { type: String, required: true },
  department: { type: String, required: true },
  date: { type: String, required: true }, 
  clockIn: { type: String, default: "--" },
  clockOut: { type: String, default: "--" },
  status: { 
    type: String, 
    enum: ["Present", "Absent", "Late", "Leave", "Half Day"], 
    required: true 
  },
  totalHrs: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("AttendanceLog", attendanceLogSchema);