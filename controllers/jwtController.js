const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = async (req, res) => {
  const { email, role } = req.body;

  const token = jwt.sign(
    { data: { email, role } },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.send({ token });
};

module.exports = { generateToken };
