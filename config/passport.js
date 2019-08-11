const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const bcrypt = require("bcrypt");

// User schema
const User = require("../models/users.js");

// Set local strategy for passport
passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
        if(err) { return done(err); }
        if(!user) {
            return done(null, false, { message: "Det finns inget konto med denna email-adressen!" });
        } else {
            // Compare password
            bcrypt.compare(password, user.password, (err, match) => {
                if(err) console.log(err);
                if(!match) {
                    return done(null, false, { message: "Lösenordet stämmer inte!" });
                } else {
                    return done(null, user);
                }
            });
        }
    });
}));

// Passport session serializer/deserializer
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

