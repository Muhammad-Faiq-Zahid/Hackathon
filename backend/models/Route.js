const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  instruction: {
    type: String,
    required: true,
  },
  distance: String,
  estimatedTime: String,
});

const routeSchema = new mongoose.Schema({
  startLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  endLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  steps: [stepSchema],
});

module.exports = mongoose.model("Route", routeSchema);
