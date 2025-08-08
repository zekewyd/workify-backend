const { collections } = require("../db");
const { ObjectId } = require("mongodb");

// GET /payroll
const getAllPayroll = async (req, res) => {
  const result = await collections.payrollCollection.find().toArray();
  res.send(result);
};

// PATCH /payroll/:id (Admin marks payroll as paid)
const markPayrollAsPaid = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      isPaid: true,
      paymentDate: new Date(Date.now()).toLocaleString(),
    },
  };
  const result = await collections.payrollCollection.updateOne(filter, updateDoc);
  res.send(result);
};

// POST /payroll (HR creates new payroll entry)
const createPayroll = async (req, res) => {
  const payrollInfo = req.body;
  const { name, email, month, year } = payrollInfo;

  // Check if payroll already exists for same month/year
  const existingPayroll = await collections.payrollCollection.findOne({
    name,
    email,
    month,
    year,
  });
  if (existingPayroll) {
    return res
      .status(400)
      .send({ message: "Payment already exists for this month and year." });
  }

  const result = await collections.payrollCollection.insertOne(payrollInfo);
  res.send(result);
};

module.exports = {
  getAllPayroll,
  markPayrollAsPaid,
  createPayroll
};
