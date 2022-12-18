const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = mongoose.model("User");

const router = express.Router();

/* GET /api/users */
router.get("/", (req, res, next) => {
  res.json({ message: "GET /users" });
});

/* POST /api/users/register */
router.post("/register", async (req, res, next) => {
  const { email, username, password } = req.body;
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (user) {
    const error = new Error("Validation Error");
    error.statusCode = 400;
    const errors = {};
    if (user.email === email) {
      errors.email = "A user has already registered with this email";
    }
    if (user.username === username) {
      errors.username = "A user has already registered with this username";
    }
    error.errors = errors;
    return next(error);
  }

  const newUser = new User({ username, email });

  bcrypt.genSalt(10, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(password, salt, async (err, hashedPassword) => {
      if (err) throw err;
      try {
        newUser.hashedPassword = hashedPassword;
        const user = await newUser.save();
        return res.json({ user });
      } catch (err) {
        next(err);
      }
    });
  });
});

module.exports = router;
