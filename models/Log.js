const mongoose = require("mongoose");

// Log Schema
const Log = new mongoose.Schema({
  userid: mongoose.Types.ObjectId,
  username: String,
  count: Number,
  log: [
    {
      description: String,
      duration: Number,
      date: {
        type: Date,
        default: () => new Date(Number(Date.now())),
      },
    },
  ],
});

module.exports = mongoose.model("Log", Log);