const mongoose = require("mongoose");

// Exercise Schema
const Exercise = new mongoose.Schema({
  userid: mongoose.Types.ObjectId,
  username: String,
  description: {
    type: String,
    require: true,
  },
  duration: {
    type: Number,
    require: true,
  },
  date: {
    type: Date,
    default: () => new Date(Number(Date.now())),
  },
});

module.exports = mongoose.model("Exercise", Exercise);