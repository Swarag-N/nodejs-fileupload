const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cron = require("node-cron");
const fs = require("fs");

const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const Admin = require("./model/Admin");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const adminRouter = require("./routes/admin");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// DB
const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/task";
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useFindAndModify", false);

app.use(
  require("express-session")({
    secret: "I have to complete this by today",
    resave: false,
    saveUninitialized: false,
  })
);

//Passport Config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/app", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", { currentUser: req.user });
});

// Empty The Temp Directory Daily at 10 PM
cron.schedule("0 22 * * *", () => {
  const directory = path.join(__dirname, "temp");
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });
});

module.exports = app;
