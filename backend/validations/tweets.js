const { check } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");

const validateTweetInput = [
  check("text")
    .exists({ checkFalsy: true })
    .isLength({ min: 5, max: 140 })
    .withMessage("Tweet must be between and 140 characters"),
  handleValidationErrors,
];

module.exports = validateTweetInput;
