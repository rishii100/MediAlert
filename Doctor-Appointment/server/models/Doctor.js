const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    description: { type: String },
    rating: { type: Number, default: 0 },
    goodReviews: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    satisfaction: { type: Number, default: 0 },
    image: { type: String, default: "assets/doctor.png" },
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
