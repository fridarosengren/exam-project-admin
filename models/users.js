// Mongodb schema for users
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define new schema
var userSchema = new Schema ({
    email: { type: String, required: true, unique: true }, 
   // username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Send schema
module.exports = mongoose.model("User", userSchema);