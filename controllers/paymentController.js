const { collections } = require("../db");

// POST /paymentHistory (Admin adds payment record)
const addPaymentHistory = async (req, res) => {
  const paymentInfo = req.body;
  const result = await collections.paymentHistoryCollection.insertOne(paymentInfo);
  res.send(result);
};

// GET /paymentHistory/:email (Paginated)
const getPaymentHistoryByEmail = async (req, res) => {
  const email = req.params.email;
  const query = { email };

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const result = await collections.paymentHistoryCollection
    .find(query)
    .skip(page * limit)
    .limit(limit)
    .sort({ year: 1, month: 1 })
    .toArray();

  res.send(result);
};

// GET /paymentHistoryCount/:email
const getPaymentHistoryCount = async (req, res) => {
  const email = req.params.email;
  const query = { email };
  const count = await collections.paymentHistoryCollection.countDocuments(query);
  res.send({ count });
};

// GET /paymentHistoryForBarChart/:email
const getPaymentHistoryForBarChart = async (req, res) => {
  const email = req.params.email;
  const query = { email };
  const result = await collections.paymentHistoryCollection.find(query).toArray();
  res.send(result);
};

module.exports = {
  addPaymentHistory,
  getPaymentHistoryByEmail,
  getPaymentHistoryCount,
  getPaymentHistoryForBarChart
};
