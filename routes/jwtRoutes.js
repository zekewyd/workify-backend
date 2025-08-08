const express = require("express");
const router = express.Router();
const { generateToken } = require("../controllers/jwtController");

// POST /jwt
router.post("/", generateToken);

module.exports = router;
