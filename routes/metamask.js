const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  verifyToken,
  verifyTokenAndAuthorization,
} = require("../middleware/auth");
const User = require("../models/User");
const dotenv = require("dotenv");
const { nonces } = require("../config/nonces");
dotenv.config({ path: "../config/config.env" });

// @ route    POST api/metamask/getChallenge
// @ desc     Get challenge from backend to solve
// @ access   Public
router.post(
  "/getChallenge",
  body("userAccount", "No address attached").isEthereumAddress(),
  // body("password", "Password is required").exists(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userAccount } = req.body;
    const nonce = Math.floor(Math.random() * 1e6).toString(); // Random nonce
    nonces[userAccount] = nonce;
    res.status(200).json({ challenge: `Login to Sneakers: ${nonce}` });
  }
);

module.exports = router;
