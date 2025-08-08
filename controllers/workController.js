const { collections } = require("../db");
const { ObjectId } = require("mongodb");

// GET /employeeWorkSheet/name (All employee names for dropdowns, etc.)
const getAllEmployeeNames = async (req, res) => {
  const result = await collections.employeeWorkSheetCollection
    .find()
    .project({ name: 1, _id: 1 })
    .toArray();
  res.send(result);
};

// GET /employeeWorkSheet (Filter by name/month)
const getFilteredEmployeeWorkSheets = async (req, res) => {
  const { employeeName, month } = req.query;
  const filter = {};

  if (month) filter.month = month;
  if (employeeName && employeeName !== "allEmployees") {
    filter.name = employeeName;
  }

  const result = await collections.employeeWorkSheetCollection.find(filter).toArray();
  res.send(result);
};

// POST /employeeWorkSheet (Employee creates a task)
const createEmployeeWorkSheet = async (req, res) => {
  const employeeInfo = req.body;
  const result = await collections.employeeWorkSheetCollection.insertOne(employeeInfo);
  res.send(result);
};

// GET /employeeWorkSheet/:email (Tasks for specific user)
const getEmployeeWorkSheetsByEmail = async (req, res) => {
  const email = req.params.email;
  const query = { email };
  const result = await collections.employeeWorkSheetCollection
    .find(query)
    .sort({ _id: -1 })
    .toArray();
  res.send(result);
};

// PUT /employeeWorkSheet/:id (Update task)
const updateEmployeeWorkSheet = async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = { $set: data };

  const result = await collections.employeeWorkSheetCollection.updateOne(filter, updateDoc);
  res.send(result);
};

// DELETE /employeeWorkSheet/:id (Delete task)
const deleteEmployeeWorkSheet = async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await collections.employeeWorkSheetCollection.deleteOne(query);
  res.send(result);
};

module.exports = {
  getAllEmployeeNames,
  getFilteredEmployeeWorkSheets,
  createEmployeeWorkSheet,
  getEmployeeWorkSheetsByEmail,
  updateEmployeeWorkSheet,
  deleteEmployeeWorkSheet
};
