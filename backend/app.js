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

if (isProduction) {
  const path = require("path");
  // Serve the frontend's index.html file at the root route
  app.get("/", (req, res) => {
    res.cookie("CSRF-TOKEN", req.csrfToken());
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });

  // Serve the static assets in the frontend's build folder
  app.use(express.static(path.resolve("../frontend/build")));

  // Serve the frontend's index.html file at all other routes NOT starting with /api
  app.get(/^(?!\/?api).*/, (req, res) => {
    res.cookie("CSRF-TOKEN", req.csrfToken());
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });
}

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
app.use((err, _req, res, _next) => {
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
