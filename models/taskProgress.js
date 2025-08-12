const mongoose = require("mongoose");

const taskProgressSchema = new mongoose.Schema({
  taskID: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  hoursWorked: { type: Number, default: null },
  progressStatus: { type: String, enum: ["in progress", "pending", "completed"], default: "in progress" },
  completionDate: { type: Date, default: null }
}, { timestamps: true });

function autoPopulate(next) {
  this.populate("taskID", "taskName status")
      .populate("userID", "username");
  next();
}

taskProgressSchema
  .pre("find", autoPopulate)
  .pre("findOne", autoPopulate)
  .pre("findById", autoPopulate);
  
module.exports = mongoose.model("TaskProgress", taskProgressSchema);
