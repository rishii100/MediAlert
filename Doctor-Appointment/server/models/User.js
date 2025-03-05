const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true }, // Added email field
    otp: { type: String },
    deviceToken: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
