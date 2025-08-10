const SalaryPayment = require("../models/salaryPayment");

exports.createSalaryPayment = async (req, res) => {
  try {
    const payment = await SalaryPayment.create(req.body);
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSalaries = async (req, res) => {
  try {
    let salaries;
    if (req.user.role === "employee") {
      salaries = await SalaryPayment.find({ userID: req.user._id }).populate("userID");
    } else if (req.user.role === "hr") {
      salaries = await SalaryPayment.find().populate("userID", "username role").where("userID.role").equals("employee");
    } else {
      salaries = await SalaryPayment.find().populate("userID");
    }
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSalaryAmount = async (req, res) => {
  try {
    const payment = await SalaryPayment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Salary record not found" });

    payment.salaryHistory.push({ amount: payment.amount });
    payment.amount = req.body.amount;
    await payment.save();

    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
