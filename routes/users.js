// Requires
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const randomize = require("randomatic");
const { authenticateUser } = require("../config/auth.js");

// Page render routes
router.get("/admin", authenticateUser, (req, res) => res.render('admin'));
router.get("/account", authenticateUser, (req, res) => res.render('account'));

// Use defined schema for database
let User = require("../models/users.js");

// Set email-address for sending emails 
const sendingEmail = "exarbetemiun@gmail.com";

// Setup service for nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: sendingEmail,
        pass: "Miun2019"
    }
});

// Register new user 
router.post("/admin", (req, res) => {

    // Check if account already exists
    User.findOne({ email: req.body.email }, (err, user) => {
        if(err) console.log(err) // Show error 
        if(user) {
            res.render("admin", { errormsg: "Det finns redan ett konto registrerat med denna mailadressen!" });
        } else {
            // Create account
            // Generate random password
            let password = randomize("Aa0!", 10);

            // Hash password
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if(err) console.log(err); // Show error

                // Create new instance of user schema
                let newUser = new User();

                // Get body values to schema
                newUser.email = req.body.email;
                newUser.password = hashedPassword;

                // Save new user to database
                newUser.save(err => {
                    if(err) {
                        console.log(err); // Send error
                        res.render("admin", { errormsg: "Vänligen fyll i en email!"});
                    } else {
                        // Send email to user with login details
                        // Set up email
                        let mailOptions = {
                            from: sendingEmail,
                            to: req.body.email,
                            subject: "Nytt konto för avdelningens presentationssystem!",
                            html: `<p>Nu är ditt konto registrerat! <br />
                                    Ditt lösenord är ${password}</p>`
                        };

                        // Send email
                        transporter.sendMail(mailOptions, (err) => {
                            if(err) console.log(err);
                        });

                        // Return message if successful
                        res.render("admin", { successmsg: "Inloggningsuppgifter skickade till användaren!"});
                    }
                });
            });
        }
    });
});

// Reset forgotten password
router.get("/password/reset/:id", (req, res) => {

    // Get id of user
    let id = req.params.id;

    // Create new password
    let newPassword = randomize("Aa0!", 10);

    // Hash new password
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if(err) console.log(err); // Show errors

        // Find user in database and update password
        User.findOneAndUpdate(
            { _id: id},
            { $set: { password: hashedPassword } },
            { new: true },
            (err, user) => {
                if(err) console.log(err); // Show error
                // Send user new password
                // Set up email
                let mailOptions = {
                    from: sendingEmail,
                    to: user.email,
                    subject: "Nytt lösenord till presentationssystemet!",
                    html: `<p>Här kommer ditt nya lösenord! <br />
                            Ditt lösenord är ${newPassword} </p>`
                };

                // Send email
                transporter.sendMail(mailOptions, (err) => {
                    if(err) console.log(err);
                });

                // Render page and send message if succsessful
                res.render("admin", { successmsg: "Nytt lösenord skickat till användaren!" });
            }
        );
    });
});

// User password change
router.post("/password/change", (req, res) => {

    // Get user to change
    let email = req.body.email;

    // Get old and new password
    let password = req.body.password;
    let newPassword = req.body.newPassword;

    User.findOne({ email: email }, (err, user) => {
        if(err) console.log(err); // Show errors
        if(!user) {
            res.render("account", { errormsg: "Kunde inte hitta användare, vänligen försök igen!"});
        } else {
            // Dehash password 
            bcrypt.compare(password, user.password, (err, match) => {
                if(err) res.send(err); // Send error
                if(match) {
                    // Hash new password
                    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                        if(err) console.log(err); // Show errors
                        
                        // Save new hashed password to database
                        user.password = hashedPassword;
                        user.save(err => {
                            if(err) res.send(err); // Send error
                            
                            // Send message if successful
                            res.render("account", { successmsg: "Ändring av lösenord lyckades!" });
                        });
                    });
                } else if(!match) {
                    res.render("account", { errormsg: "Lösenordet matchar inte!" });
                }
            });
        }
    });
});

// GET list of users
router.get("/userlist", (req, res) => {
    User.find({}, (err, userList) => {
        if(err) console.log(err);
        res.send(userList);
    });
});

// DELETE user
router.delete("/user/:id", (req, res) => {
    // Get user id
    let id = req.params.id;

    // Delete user
    User.deleteOne({
        _id: id
    }, (err) => {
        if(err) console.log(err); // Show error
        res.send({message: "Användare borttagen!"})
    });
});

module.exports = router;