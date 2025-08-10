const mongoose = require("mongoose");

const salaryPaymentSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  paymentStatus: { type: String, enum: ["paid", "pending"], default: "pending" },
  salaryHistory: [{
    amount: Number,
    changedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

function autoPopulate(next) {
  this.populate("userID", "username role");
  next();
}

salaryPaymentSchema
  .pre("find", autoPopulate)
  .pre("findOne", autoPopulate)
  .pre("findById", autoPopulate);

module.exports = mongoose.model("SalaryPayment", salaryPaymentSchema);
