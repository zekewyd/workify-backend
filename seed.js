require("dotenv").config();
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

async function seed() {
  const client = new MongoClient(process.env.URI);
  try {
    await client.connect();
    const db = client.db("final-assignments");

    // hass passwords for default users
    const hashedAdminPass = await bcrypt.hash("admin123", 10);
    const hashedHrPass = await bcrypt.hash("hr1234", 10);
    const hashedEmployeePass = await bcrypt.hash("employee123", 10);

    // 1. Users
    const users = [
      {
        name: "Admin",
        email: "admin@example.com",
        password: hashedAdminPass,
        role: "admin",
        salary: 0,
        isVerified: true,
        isFired: false,
      },
      {
        name: "HR",
        email: "hr@example.com",
        password: hashedHrPass,
        role: "hr",
        salary: 50000,
        isVerified: true,
        isFired: false,
      },
      {
        name: "Employee",
        email: "employee@example.com",
        password: hashedEmployeePass,
        role: "employee",
        salary: 30000,
        isVerified: true,
        isFired: false,
      },
    ];
    await db.collection("users").insertMany(users);

    // 2. Employee Work Sheet
    const workSheets = [
      {
        name: "Klei Ishia",
        email: "employee@example.com",
        month: "January",
        year: 2025,
        task: "Prepare monthly sales report",
        hours: 5,
      },
    ];
    await db.collection("employeeWorkSheet").insertMany(workSheets);

    // 3. Fired User
    const firedUsers = [
      {
        name: "Regine Mae",
        email: "fired@example.com",
        isFired: true,
        reason: "Repeated policy violations",
      },
    ];
    await db.collection("firedUser").insertMany(firedUsers);

    // 4. Payroll
    const payrolls = [
      {
        name: "Klei Ishia",
        email: "employee@example.com",
        month: "January",
        year: 2025,
        salary: 30000,
        isPaid: true,
        paymentDate: new Date().toLocaleString(),
      },
    ];
    await db.collection("payroll").insertMany(payrolls);

    // 5. Payment History
    const paymentHistories = [
      {
        email: "employee@example.com",
        month: "January",
        year: 2025,
        amount: 30000,
        date: new Date().toLocaleString(),
      },
    ];
    await db.collection("paymentHistory").insertMany(paymentHistories);

    // 6. Contact Messages
    const contacts = [
      {
        email: "visitor@example.com",
        message: "I love your company website!",
        date: new Date().toLocaleString(),
      },
    ];
    await db.collection("contact").insertMany(contacts);

    console.log("✅ Seeding complete!");
    console.log("💻 Default logins:");
    console.log("Admin → admin@example.com / admin123");
    console.log("HR → hr@example.com / hr123");
    console.log("Employee → employee@example.com / employee123");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await client.close();
  }
}

seed();
