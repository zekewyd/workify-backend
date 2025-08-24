require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const app = express();
const port = process.env.PORT || 9000;

connectDB();

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"], credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/department", require("./routes/deptRoutes"));
app.use("/tasks", require("./routes/taskRoutes"));
app.use("/progress", require("./routes/progressRoutes"));
app.use("/payments", require("./routes/paymentRoutes"));
app.use("/user-department", require("./routes/userDeptRoutes"));
app.use("/emp-info", require("./routes/empInfoRoutes"));
app.use("/attendance", require("./routes/attendanceRoutes"));
app.use("/schedule", require("./routes/scheduleRoutes"));



app.get("/", (req, res) => res.send("Workify Backend"));

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));