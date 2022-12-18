const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const { isProduction } = require("./config/keys");
const usersRouter = require("./routes/api/users");
const tweetsRouter = require("./routes/api/tweets");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
if (!isProduction) {
  app.use(cors());
}

app.use("/api/users", usersRouter);
app.use("/api/tweets", tweetsRouter);

module.exports = app;
