const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

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

    // Send OTP via email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "MediAlert - Your OTP for Registration",
      html: ` 
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; 
padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;"> 
          <h2 style="color: #8873f4; text-align: center;">MediAlert</h2> 
          <p>Hello ${firstName} ${lastName},</p> 
          <p>Thank you for registering with MediAlert. Your One-Time Password (OTP) for 
verification is:</p> 
          <h1 style="text-align: center; color: #333; letter-spacing: 5px; font-size: 
32px;">${otp}</h1> 
          <p>This OTP is valid for 10 minutes. Please do not share this with anyone.</p> 
          <p>If you did not request this OTP, please ignore this email.</p> 
          <p>Best regards,<br>The MediAlert Team</p> 
        </div> 
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "OTP sent successfully to your email",
      userId: user._id,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Registration failed", error: error.message });
  }
};

// Send OTP Again (For Login)
exports.sendOTP = async (req, res) => {
  try {
    const { phone, email } = req.body;

    // Try to find user by phone or email
    let user;
    if (phone) {
      user = await User.findOne({ phone });
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    user.otp = otp;
    await user.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "MediAlert - Your Login OTP",
      html: ` 
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; 
padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;"> 
          <h2 style="color: #8873f4; text-align: center;">MediAlert</h2> 
          <p>Hello ${user.firstName} ${user.lastName},</p> 
          <p>Your One-Time Password (OTP) for logging into MediAlert is:</p> 
          <h1 style="text-align: center; color: #333; letter-spacing: 5px; font-size: 
32px;">${otp}</h1> 
          <p>This OTP is valid for 10 minutes. Please do not share this with anyone.</p> 
          <p>If you did not request this OTP, please ignore this email.</p> 
          <p>Best regards,<br>The MediAlert Team</p> 
        </div> 
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent successfully to your email" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

// Verify OTP and Login
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, email, otp } = req.body;

    // Try to find user by phone or email
    let user;
    if (phone) {
      user = await User.findOne({ phone, otp });
    } else if (email) {
      user = await User.findOne({ email, otp });
    }

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
