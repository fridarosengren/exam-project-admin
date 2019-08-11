// Imports
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { authenticateUser } = require("../config/auth.js");
const fs = require("fs");

// Page render routes
router.get("/employees", authenticateUser, (req, res) => res.render('employees'));
router.get("/info", authenticateUser, (req, res) => res.render('information'));
router.get("/news", authenticateUser, (req, res) => res.render('news'));

// Use defined schemas for database
const Employee = require("../models/employees");
const News = require("../models/news");
const Info = require("../models/info");

// Multer setup for saving images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + Date.now() + path.extname(file.originalname).toLowerCase());
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        if(file.mimetype !== "image/png" && file.mimetype !== "image/jpeg"){
            return cb(new Error("Fel filtyp! Tillåtna filtyper är .png|.jpg|.jpeg"));
        }
        cb(null, true);
    }
});

// Get information template info
router.get("/information", (req, res) => {
    Info.find({}, (err, information) => {
        if(err) console.log(err);
        res.send(information);
    });
});

// Create/edit information template
router.post("/information", (req, res) => {
    
    // Look for and edit or create template info
    Info.findOneAndUpdate(
        { },
        { $set: {
            infoName: req.body.infoName,
            infoFieldOne: req.body.infoFieldOne,
            infoFieldTwo: req.body.infoFieldTwo,
        }},
        { upsert: true },
        err => {
            if(err) console.log(err); // Show error
        }
    );
    res.render("information");
});

// Multer setup for information-page
let infoImageUpload = upload.single("infoImage");

// Upload new image to info template
router.post("/information/image", (req, res) => {
    infoImageUpload(req, res, (err) => {
        if(err) {
            res.render("information", { errormsg: "Bilden är för stor, eller har fel filformat. Försök igen!" });
        } else {
            // Check if image has been chosen or not
            if(req.file != undefined){
                // Upload/replace image in database
                Info.findOneAndUpdate(
                    { },
                    { $set: {
                        infoImage: req.file.filename
                    }},
                    { upsert: true },
                    (err, doc) => {
                        if(err) console.log(err); // Show error
                        
                        // Delete old image from server
                        fs.unlink("./public/uploads/" + doc.infoImage, err => {
                            if(err) console.log(err); // Show error
                        });
                    }
                );
                res.render("information");
            } else {
                // Write error message
                res.render("information", { errormsg: "Vänligen välj en bild!"});
            }
        }
    });
});

// Get employees 
router.get("/employeelist", (req, res) => {
    Employee.find({}, (err, employeeList) => {
        if(err) console.log(err);
        res.send(employeeList);
    });
});

// Get specific employee
router.get("/employee/:id", (req, res) => {
    // Get employee id
    let id = req.params.id;

    // Find in database and return result
    Employee.findById(id, (err, emp) => {
        if(err) console.log(err);
        res.send(emp);
    });
});

// Multer setup for employee-page
let empImageUpload = upload.single("empImage");

// Create new employee-profile
router.post("/employees", (req, res) => {

    // Upload image
    empImageUpload(req, res, (err) => {
        if(err){
            res.render("employees", { errormsg: "Bilden är för stor, eller har fel filformat. Försök igen!" });
        } else {
            // New employee-schema
            let newEmployee = new Employee();

            // Get body values
            newEmployee.empName = req.body.empName;
            newEmployee.empRoom = req.body.empRoom;
            newEmployee.empPhoneNr = req.body.empPhoneNr;
            newEmployee.empDescription = req.body.empDescription;

            // Check if image has been chosen or not
            if(req.file != undefined){
                newEmployee.empImage = req.file.filename;
            } else {
                newEmployee.empImage = "noimage.png"; // Show noimage instead of uploaded img
            }

            // Save new employee info in database
            newEmployee.save(err => {
                if(err) {
                    console.log(err);
                    res.render("employees", { errormsg: "Fyll i alla fält!"});
                } else {
                    res.render("employees", { successmsg: "Personal-profil skapad!"});
                }
            });
        }
    });
});

// Edit employee 
router.put("/employees/:id", (req, res) => {
    // Get employee info
    let id = req.params.id;

    // Find in database and update
    Employee.findOneAndUpdate(
        { _id: id },
        { $set: {
            empName: req.body.empEditName,
            empRoom: req.body.empEditRoom,
            empPhoneNr: req.body.empEditPhoneNr,
            empDescription: req.body.empEditDescription
        }},
        err => {
            if(err) console.log(err);
        }
    );
});

// Delete employee info
router.delete("/employees/:id", (req, res) => {
    // Get employee id
    let id = req.params.id;

    // Delete employee info from database
    Employee.findOneAndDelete({
        _id: id
    }, (err, doc) => {
        if(err) console.log(err); // Show error

        // Delete image from server
        if(doc.empImage != "noimage.png"){
            fs.unlink("./public/uploads/" + doc.empImage, err => {
                if(err) console.log(err); // Show error
            });
        }
        
        // Send response
        res.send({message: "Personal-info borttagen!"})
    });
});

// Get news 
router.get("/newslist", (req, res) => {
    News.find({}, (err, newsList) => {
        if(err) console.log(err);
        res.send(newsList);
    });
});

// Get specific news post
router.get("/news/:id", (req, res) => {
    // Get news id
    let id = req.params.id;

    // Find in database and return result
    News.findById(id, (err, post) => {
        if(err) console.log(err);
        res.send(post);
    });
});

// Multer setup for news-page
let newsImageUpload = upload.single("newsImage");

// Create new news post
router.post("/news", (req, res) => {

    // Upload image
    newsImageUpload(req, res, (err) => {
        if(err) {
            res.render("news", { errormsg: "Bilden är för stor, eller har fel filformat. Försök igen!" });
        } else {
            // New News-schema
            let newsPost = new News();

            // Check if image has been chosen or not
            if(req.file != undefined){
                newsPost.newsImage = req.file.filename;
            } else {
                newsPost.newsImage = "newsimage.png"; // Show alternative image instead of uploaded img
            }

            // Get body values
            newsPost.newsHeading = req.body.heading;
            newsPost.newsText = req.body.text;

            // Save new news-post in database
            newsPost.save(err => {
                if(err) {
                    console.log(err); // Show error
                    res.render("news", { errormsg: "Fyll i alla fält!"});
                } else {
                    res.render("news", { successmsg: "Nyhet skapad!"});
                }
            });
        }
    });
});

// Edit news post
router.put("/news/:id", (req, res) => {
    // Get employee info
    let id = req.params.id;

    // Find in database and update
    News.findOneAndUpdate(
        { _id: id },
        { $set: {
            newsHeading: req.body.newsHeading,
            newsText: req.body.newsText,
        }},
        err => {
            if(err) console.log(err);
        }
    );
});

// Delete news post
router.delete("/news/:id", (req, res) => {
    // Get news id
    let id = req.params.id;

    // Delete employee info
    News.findOneAndDelete({
        _id: id
    }, (err, doc) => {
        if(err) console.log(err); // Show error

        // Delete image from server
        if(doc.newsImage != "nonewsimage.png"){
            fs.unlink("./public/uploads/" + doc.newsImage, err => {
                if(err) console.log(err); // Show error
            });
        }

        // Send response
        res.send({message: "Nyhet borttagen!"})
    });
});


module.exports = router;