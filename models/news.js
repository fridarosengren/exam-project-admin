// Mongodb schema for news template
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define new schema
const newsSchema = new Schema({
    newsHeading: { type: String, required: true },
    newsText: { type: String, required: true },
    newsImage: { type: String }
});

// Send schema
module.exports = mongoose.model("News", newsSchema);