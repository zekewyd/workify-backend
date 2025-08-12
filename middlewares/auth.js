const { verifyToken: verifyJwtToken } = require("../config/jwt");
const Users = require("../models/users");

exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const decoded = verifyJwtToken(token);
    if (!decoded) return res.status(403).json({ message: "Invalid token" });

    const user = await Users.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // fetch user details
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
