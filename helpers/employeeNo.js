const PersonalInfo = require("../models/personalInfo");

async function generateEmployeeNo() {
  const year = new Date().getFullYear().toString().slice(-2);
  const regex = new RegExp(`^EM${year}`);
  const lastEmployee = await PersonalInfo.findOne({ employeeNo: regex })
    .sort({ employeeNo: -1 })
    .exec();

  let nextNumber = 1;
  if (lastEmployee) {
    const lastNumber = parseInt(lastEmployee.employeeNo.slice(4)); 
    nextNumber = lastNumber + 1;
  }

  return `EM${year}${String(nextNumber).padStart(3, "0")}`;
}

module.exports = generateEmployeeNo;
