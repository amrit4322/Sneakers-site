const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyTokenAndAdmin } = require("../middleware/auth");
const dotenv = require("dotenv");
const { nonces } = require("../config/nonces");
const { ethers } = require("ethers");
dotenv.config({ path: "../config/config.env" });

// @ route GET api/user
// @ desc  Get registered user
// @ access Private
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({ msg: "User Not Found" });
    }
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @ route GET api/user
// @ desc  Get registered user
// @ access Private
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @ route GET api/user/stats
// @ desc  Get total number of users per month
// @ access Private
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      { $project: { month: { $month: "$createdAt" } } },
      { $group: { _id: "$month", total: { $sum: 1 } } },
    ]);
    res.status(200).json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @ route POST api/user
// @ desc  Register user
// @ access Public
router.post(
  "/",
  body("username", "Please enter a username").not().isEmpty(),
  body("email", "Please include a valid email").isEmail(),
  body(
    "userAccount",
    "Please attach Metamask for registration"
  ).isEthereumAddress(),
  body("signature", "Signature is required").exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstname, lastname, username, email, userAccount, signature } =
      req.body;

    try {
      let user = await User.findOne({ userAccount });

      if (user) {
        return res.status(409).send("User already exists");
      }

      const challenge = nonces[userAccount];
      if (!challenge) {
        return res
          .status(403)
          .json({ errors: "No challenge found for this address" });
      }

      // Recover the signer from the signature
      const recoveredAddress = ethers.verifyMessage(
        `Login to Sneakers: ${challenge}`,
        signature
      );

      if (recoveredAddress.toLowerCase() === userAccount.toLowerCase()) {
        delete nonces[userAccount]; // Invalidate nonce

        // CREATE A NEW USER
        user = new User({
          firstname,
          lastname,
          username,
          email,
          userAccount,
        });

        // let salt = await bcrypt.genSalt(10);
        // user.password = await bcrypt.hash(password, salt);

        await user.save();
        console.log("successfully registered");
        const payload = {
          user: {
            id: user.id,
            // only an admin can take CRUD operations to collections & delete any users
            // if not an admin, the user can only make CRUD operations to his/her account
            isAdmin: user.isAdmin,
          },
        };
        jwt.sign(
          payload,
          process.env.JWTSECRET,
          {
            expiresIn: 360000,
          },
          (error, token) => {
            if (error) throw error;
            res.status(201).json({ token });
          }
        );
      } else {
        return res.status(403).send("Invalid signature");
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
