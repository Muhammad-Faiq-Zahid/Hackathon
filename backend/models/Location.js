const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  qrCode: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  building: String,
  floor: Number,
  category: {
    type: String,
    enum: [
      "entrance",
      "office",
      "classroom",
      "lab",
      "cafeteria",
      "restroom",
      "other",
    ],
    default: "other",
  },
  imageUrl: String,
  destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location" }],
});

module.exports = mongoose.model("Location", locationSchema);
