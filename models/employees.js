// Mongodb schema for employee template
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define new schema
const employeeSchema = new Schema({
    empImage: { type: String },
    empName: { type: String, required: true },
    empRoom: { type: String },
    empPhoneNr: { type: String },
    empDescription: { type: String }
});

// Send schema
module.exports = mongoose.model("Employee", employeeSchema);