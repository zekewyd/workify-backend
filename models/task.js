const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskName: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "in progress", "for approval", "approved", "completed"], default: "pending" }
}, { timestamps: true });

function autoPopulate(next) {
  this.populate("assignedTo", "username email")
      .populate("assignedBy", "username role");
  next();
}

taskSchema
  .pre("find", autoPopulate)
  .pre("findOne", autoPopulate)
  .pre("findById", autoPopulate);

module.exports = mongoose.model("Task", taskSchema);
