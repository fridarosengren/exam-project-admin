const express = require("express");
const router = express.Router();
const passport = require("passport");
const { authenticateUser } = require("../config/auth.js");

// Set base routes
router.get("/", (req, res) => res.redirect('login'));
router.get("/login", (req, res) => res.render('login'));
router.get("/dashboard", authenticateUser, (req, res) => res.render('dashboard')); 

// Login
router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if(err) console.log(err); // Show error
        if(!user) { 
            if(info.message == "Missing credentials"){
                return res.render("login", {errormsg: "Vänligen fyll i alla fält!"});
            } else {
                return res.render("login", {errormsg: info.message});
            }
        }           
        req.logIn(user, (err) =>{
            if(err) console.log(err); // Show error

            // Show logged in users name
            req.session.loggedInUser = user.email.split("@")[0];

            // Redirect user to dashboard if successful login
            return res.redirect("/dashboard");
        });
    })(req, res, next);
});

// Logout user
router.get("/logout", (req, res) => {
    req.logOut(); // Clear login session
    if(req.session != null){ req.session.destroy(); } // Destroy session
    res.redirect("/"); // Redirect to login-page
});

module.exports = router;