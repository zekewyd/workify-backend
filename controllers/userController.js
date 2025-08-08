const { collections } = require("../db");
const { ObjectId } = require("mongodb");

// POST /users/:email
const createUser = async (req, res) => {
  const email = req.params.email;
  let userInfo = req.body;

  const user = await collections.userCollection.findOne({ email });
  if (user) return res.status(400).send({ message: "User already exists" });

  userInfo.isVerified = false;
  userInfo.isFired = false;

  const result = await collections.userCollection.insertOne(userInfo);
  res.send(result);
};

// GET /users/:email
const getUserByEmail = async (req, res) => {
  const email = req.params.email;
  const result = await collections.userCollection.findOne({ email });
  res.send(result);
};

// GET /employees/role/:email
const getLoggedInUserRole = async (req, res) => {
  const email = req.params.email;
  const result = await collections.userCollection.findOne({ email });
  res.send(result);
};

// GET /verified-employees
const getVerifiedEmployees = async (req, res) => {
  const query = {
    isVerified: true,
    role: { $ne: "admin" },
  };
  const result = await collections.userCollection.find(query).toArray();
  res.send(result);
};

// PATCH /verified-employees/:email
const makeEmployeeHR = async (req, res) => {
  const email = req.params.email;
  const filter = { email };
  const updateDoc = { $set: { role: "hr" } };

  const result = await collections.userCollection.updateOne(filter, updateDoc);
  res.send(result);
};

// PATCH /salary-adjustment/:email
const adjustSalary = async (req, res) => {
  const email = req.params.email;
  const { increasingSalary } = req.body;

  const filter = { email };
  const updateDoc = { $set: { salary: increasingSalary } };

  const result = await collections.userCollection.updateOne(filter, updateDoc);
  res.send(result);
};

// GET /employees
const getAllEmployees = async (req, res) => {
  const result = await collections.userCollection
    .find({ role: { $nin: ["admin"] } })
    .toArray();
  res.send(result);
};

// PATCH /employeesVerified/:id
const toggleEmployeeVerification = async (req, res) => {
  const id = req.params.id;
  const { isVerified } = req.body;

  const filter = { _id: new ObjectId(id) };
  const updateDoc = { $set: { isVerified } };

  const result = await collections.userCollection.updateOne(filter, updateDoc);
  res.send(result);
};

// GET /employeesDetails/:email
const getEmployeeDetails = async (req, res) => {
  const email = req.params.email;
  const result = await collections.userCollection.findOne({ email });
  res.send(result);
};

// Disable user (POST to firedUserCollection)
const disableUser = async (req, res) => {
  const employeeInfo = req.body;
  const result = await collections.firedUserCollection.insertOne(employeeInfo);
  res.send(result);
};

// Get all disabled users
const getDisabledUsers = async (req, res) => {
  const result = await collections.firedUserCollection.find().toArray();
  res.send(result);
};

// Patch user as disabled in userCollection
const markUserAsDisabled = async (req, res) => {
  const email = req.params.email;
  const filter = { email };
  const updateDoc = { $set: { isFired: true } };

  const result = await collections.userCollection.updateOne(filter, updateDoc);
  res.send(result);
};

module.exports = {
  createUser,
  getUserByEmail,
  getLoggedInUserRole,
  getVerifiedEmployees,
  makeEmployeeHR,
  adjustSalary,
  getAllEmployees,
  toggleEmployeeVerification,
  getEmployeeDetails
};
