const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  scheduleName: { type: String, required: true, trim: true },
  scheduleDescription: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  scheduleType: { type: String, enum: ["Full Time", "Half Day"], required: true },
  workDays: [{ type: String, enum: ["S", "M", "T", "W", "Th", "F", "Sa"] }],
  workStart: { type: String, required: true },
  workEnd: { type: String, required: true },
  latenessGrace: { type: Number, required: true },
  absenceGrace: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },

  // store employees assigned to this schedule 
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "PersonalInfo" }]
}, { timestamps: true });

module.exports = mongoose.model("Schedules", scheduleSchema);
