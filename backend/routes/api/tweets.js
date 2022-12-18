const express = require("express");
const router = express.Router();

/* GET tweets listing. */
router.get("/", (req, res, next) => {
  res.json({ message: "GET /api/tweets" });
});

module.exports = router;
