var express = require("express");
var router = express.Router();
const Admin = require("../model/Admin");
var passport		= require("passport");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {currentUser:req.user,title:"null"});
});

//Register Form
router.get("/register", (request, respond) => {
  respond.render("register", { currentUser: request.user });
});

//Sign Up Logic
router.post("/register", (request, respond) => {
  var newAdmin = new Admin({ username: request.body.username });
  Admin.register(newAdmin, request.body.password, (err, createdAdmin) => {
    if (err) {
      console.log(err);
      console.log(err.message);
      request.flash("error", err.message);
      return respond.redirect("register");
    }
    console.log(createdAdmin.username);
    // request.flash("success","You Have created a account");
    passport.authenticate("local")(request, respond, () => {
      respond.redirect("/app");
    });
  });
});

//Login Form
router.get("/login", (request, respond) => {
  // console.log(request.flash("error"));
  respond.render("login",{currentUser:request.user});
});

//apk.post("/login", middleware,callback)
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/app",
    failureRedirect: "/login",
  }),
  (request, respond) => {}
);

//LogOut Route
router.get("/logout", (request, respond) => {
  // request.flash("success", "loged you out");
  request.logout();
  respond.redirect("/");
});


module.exports = router;
