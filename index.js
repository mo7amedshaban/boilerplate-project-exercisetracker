const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Connect to database
try {
  mongoose.connect(process.env.DB_URL);
} catch (e) {
  console.log(e);
}

// Models
const User = require("./models/User");
const Exercise = require("./models/Exercise");
const Log = require("./models/Log");

//
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

// Route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// API //

app.get("/api/hello", (req, res) => {
  res.status(200).json({ hi: "Hello, world!" });
});

// User api
app.get("/api/users", async (req, res) => {
  let allUsers = await User.find({});
  res.status(200).json(allUsers);
});

app.post("/api/users", (req, res) => {
  const newUser = new User({
    username: req.body.username,
  });

  newUser.save();

  res.status(200).json({
    _id: newUser._id,
    username: newUser.username,
  });
});

// Exercises
app.post("/api/users/:_id/exercises", async (req, res) => {
  const user = await User.findById(req.params._id);
  let userDate = req.body.date;

  if (req.body.date) {
    let date = req.body.date.split("-");
    userDate = new Date(date[0], date[1] - 1, date[2]);
  }

  const newExercies = new Exercise({
    user: req.params._id,
    username: user.username,
    description: req.body.description,
    duration: req.body.duration,
    date: userDate,
  });

  await newExercies.save();

  const checkLog = await Log.find({ user: req.params._id });
  if (checkLog.length <= 0) {
    const newLog = new Log({
      user: req.params._id,
      username: user.username,
      count: 1,
      log: [
        {
          description: req.body.description,
          duration: req.body.duration,
          date: userDate,
        },
      ],
    });

    await newLog.save();

    return res.json({
      _id: user._id,
      username: user.username,
      description: newExercies.description,
      duration: newExercies.duration,
      date: newExercies.date.toDateString()
    });
  }

  const updateLog = await Log.findOne({ user: req.params._id });
  updateLog.count += 1;
  updateLog.log.push({
    description: req.body.description,
    duration: req.body.duration,
    date: userDate,
  })

  updateLog.save()

  return res.json({
    _id: user._id,
    username: user.username,
    description: newExercies.description,
    duration: newExercies.duration,
    date: newExercies.date.toDateString()
  });
});

// Log
app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  try {
    const userFound = await User.findById(userId);

    if (!userFound) {
      res.json({ Error: "User Id not valid" });
    }

    let dateObj = {};

    if (from) {
      dateObj["$gte"] = new Date(from);
    }

    if (to) {
      dateObj["$lte"] = new Date(to);
    }

    let filter = {
      user: userId,
    };

    if (from || to) {
      filter.date = dateObj;
    }

    let exercises;

    if (limit) {
      exercises = await Exercise.find(filter).limit(+limit ?? 300);
    } else {
      exercises = await Exercise.find(filter);
    }

    const logData = [];

    for (let i = 0; i < exercises.length; i++) {
      const exerciseData = {
        description: exercises[i].description,
        duration: exercises[i].duration,
        date: exercises[i].date.toDateString(),
      };

      logData.push(exerciseData);
    }

    console.log({
      username: userFound.username,
      count: exercises.length,
      _id: userFound._id,
      log: logData,
    })
    
    res.json({
      username: userFound.username,
      count: exercises.length,
      _id: userFound._id,
      log: logData,
    });

  } catch (err) {
    console.log(err);

    res.json({ Error: err });
  }
});

// Listener
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});