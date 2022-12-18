const express = require("express");
const debug = require("debug");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const csurf = require("csurf");
const { isProduction } = require("./config/keys");
require("./models/User");
require("./models/Tweet");
require("./config/passport");
const passport = require("passport");

const usersRouter = require("./routes/api/users");
const tweetsRouter = require("./routes/api/tweets");
const csrfRouter = require("./routes/csrf");

const app = express();

app.use(logger("dev"));
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
if (!isProduction) {
  app.use(cors());
}
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true,
    },
  })
);

app.use("/api/users", usersRouter);
app.use("/api/tweets", tweetsRouter);
app.use("/api/csrf", csrfRouter);

// Express custom middleware for catching all unmatched requests and formatting
// a 404 error to be sent as the response.
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.statusCode = 404;
  next(error);
});

const serverErrorLogger = debug("backend:error");
// Express custom error handler that will be called whenever a route handler or
// middleware throws an error or invokes the `next` function with a truthy value
app.use((err, req, res, next) => {
  serverErrorLogger(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    statusCode,
    errors: err.errors,
  });
});

module.exports = app;
