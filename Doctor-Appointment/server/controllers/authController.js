const User = require("../models/User");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate OTP Function
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Register New User and Send OTP
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOTP();

    const user = new User({ firstName, lastName, phone, email, otp });
    await user.save();

    // Send OTP
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res
      .status(201)
      .json({ message: "OTP sent successfully", userId: user._id });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Registration failed", error: error.message });
  }
};

// Send OTP Again (For Login)
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    user.otp = otp;
    await user.save();

    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

// Verify OTP and Login
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone, otp });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Login successful", token, user });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Verification failed", error: error.message });
  }
};
