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



app.get("/", (req, res) => res.send("Workify Backend"));

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

// STILL IN THE PROCESS OF REFACTORING

// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
// const client = require("./middleware/mongoClient");
// const { ObjectId } = require("mongodb");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// const app = express();
// const port = process.env.PORT || 9000;

// // middleware
// const corsOptions = {
//   origin: [
//     "http://localhost:5173",
//     "http://localhost:5174",
//   ],
//   credentials: true,
//   optionsSuccessStatus: 200,
// };
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(cookieParser());

// // verify token
// const verifyToken = (req, res, next) => {
//   console.log(req.headers.authorization);

//   if (!req.headers.authorization) {
//     return res.status(401).send({ message: "Unauthorize access" });
//   }
//   const token = req.headers.authorization.split(" ")[1];

//   // jwt verify
//   jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
//     if (err) {
//       return res.status(401).send({ message: "Unauthorize access" });
//     }
//     req.user = decoded;
//     next();
//   });
// };
// // send email using nodemailer
// const sendEmail = (emailAddress, message) => {
//   // create transporter
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, // true for port 465, false for other ports
//     auth: {
//       user: process.env.NODEMAILER_USER,
//       pass: process.env.NODEMAILER_PASS,
//     },
//   });
//   // Verify transporter
//   transporter.verify((error, success) => {
//     if (error) {
//       // console.log("error", error);
//     } else {
//       // console.log("success", success);
//     }
//   });
//   // transporter sendMail
//   const mailBody = {
//     from: emailAddress, // sender address
//     to: process.env.NODEMAILER_USER, // list of receivers
//     subject: "A Visitor Has Shared Their Opinion", // Subject line
//     html: `<p>${message}</p>`, // html body
//   };

//   // send email
//   transporter.sendMail(mailBody, (error, info) => {
//     if (error) {
//       // console.log(error);
//     } else {
//       // console.log(info)
//       // console.log("Email Sent: " + info?.response);
//     }
//   });
// };

// app.get("/", (req, res) => {
//   res.send("Workify Backend");
// });

// async function run() {
//   try {
//     const db = client.db("final-assignments");
//     const contactCollection = db.collection("contact");
//     const userCollection = db.collection("users");
//     const employeeWorkSheetCollection = db.collection("employeeWorkSheet");
//     const firedUserCollection = db.collection("firedUser");
//     const payrollCollection = db.collection("payroll");
//     const paymentHistoryCollection = db.collection("paymentHistory");
//     // generate jwt
//     app.post("/jwt", async (req, res) => {
//       const { email, role } = req.body;

//       const token = jwt.sign(
//         {
//           data: { email, role },
//         },
//         process.env.JWT_SECRET_KEY,
//         { expiresIn: "1h" }
//       );

//       res.send({ token });
//     });
//     // verify admin middleware
//     const verifyAdmin = async (req, res, next) => {
//       // const email = req.user?.data?.email;
//       const role = req.user?.data?.role;

//       if (!role || role !== "admin")
//         return res
//           .status(403)
//           .send({ message: "Forbidden Access! Admin Only Actions!" });

//       next();
//     };
//     // verify admin middleware
//     const verifyHr = async (req, res, next) => {
//       const role = req.user?.data?.role;
//       if (!role || role !== "hr") {
//         return res
//           .status(403)
//           .send({ message: "Forbidden Access! HR or Admin Only Actions!" });
//       }

//       next();
//     };
//     // verify Employees middleware
//     const verifyEmployees = async (req, res, next) => {
//       const role = req.user?.data?.role;

//       if (!role || role !== "employee")
//         return res.status(403).send({
//           message: "Forbidden Access! Employees or Admin Only Actions!",
//         });

//       next();
//     };

//     // user Collection
//     // post user
//     app.post("/users/:email", async (req, res) => {
//       const email = req.params.email;
//       let userInfo = req.body;
//       // existing user
//       const user = await userCollection.findOne({ email: email });
//       if (user) {
//         return res.status(400).send({ message: "User already exists" });
//       }
//       // is Verified
//       userInfo.isVerified = false;
//       userInfo.isFired = false;
//       console.log(userInfo);

//       const result = await userCollection.insertOne(userInfo);
//       res.send(result);
//     });
//     // get user  by email
//     app.get("/users/:email", async (req, res) => {
//       const email = req.params.email;
//       const query = { email };
//       const result = await userCollection.findOne(query);
//       res.send(result);
//     });

//     // dashboard api
//     // get logged in user
//     app.get("/employees/role/:email", async (req, res) => {
//       const email = req.params.email;
//       const query = { email };
//       const result = await userCollection.findOne(query);
//       res.send(result);
//     });

//     // admin work api
//     // userCollection
//     //  get all verified employees list
//     app.get("/verified-employees", async (req, res) => {
//       const query = {
//         isVerified: true,
//         role: { $ne: "admin" },
//       };
//       const result = await userCollection.find(query).toArray();
//       res.send(result);
//     });
//     // patch make HR
//     app.patch(
//       "/verified-employees/:email",
//       verifyToken,
//       verifyAdmin,
//       async (req, res) => {
//         const email = req.params.email;
//         const filter = { email: email };
//         const updateDoc = {
//           $set: {
//             role: "hr",
//           },
//         };
//         const result = await userCollection.updateOne(filter, updateDoc);
//         res.send(result);
//       }
//     );
//     // patch user Salary Adjustment
//     app.patch(
//       "/salary-adjustment/:email",
//       verifyToken,
//       verifyAdmin,
//       async (req, res) => {
//         const email = req.params.email;
//         const filter = { email };
//         const { increasingSalary } = req.body;
//         const updateDoc = {
//           $set: {
//             salary: increasingSalary,
//           },
//         };
//         const result = await userCollection.updateOne(filter, updateDoc);
//         res.send(result);
//       }
//     );
//     // payroll from Admin
//     // get all payroll
//     app.get("/payroll", async (req, res) => {
//       const result = await payrollCollection.find().toArray();
//       res.send(result);
//     });
//     // post payroll
//     app.patch("/payroll/:id", verifyToken, verifyAdmin, async (req, res) => {
//       const id = req.params.id;
//       const filter = { _id: new ObjectId(id) };
//       const updateDoc = {
//         $set: {
//           isPaid: true,
//           paymentDate: new Date(Date.now()).toLocaleString(),
//         },
//       };
//       const result = await payrollCollection.updateOne(filter, updateDoc);
//       res.send(result);
//     });

//     // payment History
//     app.post("/paymentHistory", verifyToken, verifyAdmin, async (req, res) => {
//       const paymentInfo = req.body;
//       const result = await paymentHistoryCollection.insertOne(paymentInfo);
//       res.send(result);
//     });

//     // firedUserCollection
//     // post
//     app.post("/firedUser", verifyToken, verifyAdmin, async (req, res) => {
//       const employeeInfo = req.body;
//       const result = await firedUserCollection.insertOne(employeeInfo);
//       res.send(result);
//     });
//     // get
//     app.get("/firedUser", async (req, res) => {
//       const result = await firedUserCollection.find().toArray();
//       res.send(result);
//     });
//     // patch
//     app.patch(
//       "/firedUser/:email",
//       verifyToken,
//       verifyAdmin,
//       async (req, res) => {
//         const email = req.params.email;
//         const filter = { email };
//         const updateDoc = {
//           $set: {
//             isFired: true,
//           },
//         };
//         const result = await userCollection.updateOne(filter, updateDoc);
//         res.send(result);
//       }
//     );

//     // HR HR HR HR HR work api
//     // userCollection
//     // get all employees *
//     app.get("/employees", async (req, res) => {
//       const result = await userCollection
//         .find({ role: { $nin: ["admin"] } })
//         .toArray();
//       res.send(result);
//     });
//     // toggle verified of employees
//     app.patch(
//       "/employeesVerified/:id",
//       verifyToken,
//       verifyHr,
//       async (req, res) => {
//         const id = req.params.id;
//         const { isVerified } = req.body;

//         const filter = { _id: new ObjectId(id) };
//         const updateDoc = {
//           $set: {
//             isVerified: isVerified,
//           },
//         };

//         const result = await userCollection.updateOne(filter, updateDoc);
//         res.send(result);
//       }
//     );

//     // for Details page
//     // get one employee for details
//     app.get("/employeesDetails/:email", async (req, res) => {
//       const email = req.params.email;
//       const query = { email };
//       const result = await userCollection.findOne(query);
//       res.send(result);
//     });
//     // get payment History For BarChart
//     app.get("/paymentHistoryForBarChart/:email", async (req, res) => {
//       const email = req.params.email;
//       const query = { email };
//       const result = await paymentHistoryCollection.find(query).toArray();
//       res.send(result);
//     });

//     // for Progress page and filter
//     // all employee name
//     app.get("/employeeWorkSheet/name", async (req, res) => {
//       const result = await employeeWorkSheetCollection
//         .find()
//         .project({ name: 1, _id: 1 })
//         .toArray();
//       res.send(result);
//     });
//     // progress
//     // all employee WorkSheet for month filter
//     app.get("/employeeWorkSheet", async (req, res) => {
//       const { employeeName, month } = req.query;
//       const filter = {};

//       if (month) {
//         filter.month = month;
//       }

//       if (employeeName && employeeName !== "allEmployees") {
//         filter.name = employeeName;
//       }

//       const result = await employeeWorkSheetCollection.find(filter).toArray();
//       res.send(result);
//     });

//     // payroll from HR
//     app.post("/payroll", verifyToken, verifyHr, async (req, res) => {
//       const payrollInfo = req.body;
//       // existingPayroll
//       const { name, email, month, year } = payrollInfo;
//       const existingPayroll = await payrollCollection.findOne({
//         name,
//         email,
//         month,
//         year,
//       });
//       if (existingPayroll) {
//         return res
//           .status(400)
//           .send({ message: "Payment already exists for this month and year." });
//       }
//       const result = await payrollCollection.insertOne(payrollInfo);
//       res.send(result);
//     });

//     // employee works api
//     // employeeWorkSheetCollection
//     // post
//     app.post(
//       "/employeeWorkSheet",
//       verifyToken,
//       verifyEmployees,
//       async (req, res) => {
//         const employeeInfo = req.body;
//         const result = await employeeWorkSheetCollection.insertOne(
//           employeeInfo
//         );
//         res.send(result);
//       }
//     );
//     // get task of login user
//     app.get("/employeeWorkSheet/:email", async (req, res) => {
//       const email = req.params.email;
//       const query = { email: email };
//       const result = await employeeWorkSheetCollection
//         .find(query)
//         .sort({ _id: -1 })
//         .toArray();
//       res.send(result);
//     });
//     // update task
//     app.put(
//       "/employeeWorkSheet/:id",
//       verifyToken,
//       verifyEmployees,
//       async (req, res) => {
//         const data = req.body;
//         const id = req.params.id;
//         const filter = { _id: new ObjectId(id) };

//         const updateDoc = {
//           $set: data,
//         };

//         const result = await employeeWorkSheetCollection.updateOne(
//           filter,
//           updateDoc
//         );
//         res.send(result);
//       }
//     );
//     // delete task
//     app.delete(
//       "/employeeWorkSheet/:id",
//       verifyToken,
//       verifyEmployees,
//       async (req, res) => {
//         const id = req.params.id;
//         const query = { _id: new ObjectId(id) };
//         const result = await employeeWorkSheetCollection.deleteOne(query);
//         res.send(result);
//       }
//     );

//     // get paymentHistory by user email
//     app.get("/paymentHistory/:email", async (req, res) => {
//       const email = req.params.email;
//       const query = { email };
//       // pagination
//       const page = parseInt(req.query.page);
//       const limit = parseInt(req.query.limit);

//       const result = await paymentHistoryCollection
//         .find(query)
//         .skip(page * limit)
//         .limit(limit)
//         .sort({ year: 1, month: 1 })
//         .toArray();

//       res.send(result);
//     });
//     //  paymentCount
//     app.get("/paymentHistoryCount/:email", async (req, res) => {
//       const email = req.params.email;
//       const query = { email };
//       const result = await paymentHistoryCollection.countDocuments(query);
//       res.send({ count: result });
//     });

//     // contact public
//     // contact  us post
//     app.post("/contact", async (req, res) => {
//       let userInfo = req.body;
//       userInfo.date = new Date(Date.now()).toLocaleString();
//       const { email, message } = req.body;
//       sendEmail(email, message);
//       const result = await contactCollection.insertOne(userInfo);
//       res.send(result);
//     });
//     // get
//     app.get("/contact", async (req, res) => {
//       const result = await contactCollection.find().toArray();
//       res.send(result);
//     });

//     // payments api
//     app.post(
//       "/create-payment-intent",
//       verifyToken,
//       verifyAdmin,
//       async (req, res) => {
//         const { price } = req.body;
//         const amount = parseInt(price * 100);

//         const paymentIntent = await stripe.paymentIntents.create({
//           amount: amount,
//           currency: "usd",
//           payment_method_types: ["card"],
//         });

//         res.send({
//           clientSecret: paymentIntent.client_secret,
//         });
//       }
//     );

//     // await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
