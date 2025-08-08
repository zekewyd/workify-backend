const client = require("./middleware/mongoClient");

let collections = {};

const connectDB = async () => {
  const db = client.db("workify");
  collections.contactCollection = db.collection("contact");
  collections.userCollection = db.collection("users");
  collections.employeeWorkSheetCollection = db.collection("employeeWorkSheet");
  collections.firedUserCollection = db.collection("firedUser");
  collections.payrollCollection = db.collection("payroll");
  collections.paymentHistoryCollection = db.collection("paymentHistory");

  console.log("MongoDB connected successfully!");
};

module.exports = { connectDB, collections };
