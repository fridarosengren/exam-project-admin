// Mongodb schema for information template
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define new schemas
const informationSchema = new Schema({
    infoName: { type: String },
    infoFieldOne: { type: String },
    infoFieldTwo: { type: String },
    infoImage: { type: String }
});

// Send schema
module.exports = mongoose.model("Info", informationSchema);
