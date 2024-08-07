const mongoose = require("mongoose");

// User Schema
const User = new mongoose.Schema({
  username: String,
});

module.exports = mongoose.model("User", User);