const { verifyToken: verifyJwtToken } = require("../config/jwt");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  const decoded = verifyJwtToken(token); 

  if (!decoded) return res.status(403).json({ message: "Invalid token" });

  req.user = decoded;
  next();
};
