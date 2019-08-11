// Requires
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const config = require("./config/config.json");

// Init express-app
const app = express();

// Use cors
app.use(cors());
app.options("*", cors());

// Set port and start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`));

// Connect to mongodb database
mongoose.connect(config.db, {
    useNewUrlParser: true
});
mongoose.set("useCreateIndex", true);

// Set static public folder
app.use(express.static(path.join(__dirname, "public")));

// Allow access to uploads folder
app.use("/uploads", express.static(__dirname + "/public/uploads"));

// Use body-parser to handle POST for getting values
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // ?

// Express sessions
app.use(cookieParser());
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true
    })
);

// Middleware for setting logged in user variable
app.all("*", (req, res, next) => {
    if (req.session) {
        res.locals.loggedInUser = req.session.loggedInUser;
    }
    next();
});

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport.js");

// Set up Ejs as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set path for views

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/templates", require("./routes/templates"));
