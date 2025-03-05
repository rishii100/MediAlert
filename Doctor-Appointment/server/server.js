const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("./config/database");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Swagger Documentation
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MediAlert API",
      version: "1.0.0",
      description: "API documentation for the MediAlert appointment system",
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Path to the API routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Default Route
app.get("/", (req, res) => {
  res.send("MediAlert API is running!");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", message: "Server is running" });
});

// Import Routes
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const patientRoutes = require("./routes/patientRoutes");

// Use Routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/patients", patientRoutes);

// Seed route
app.post("/api/seed", async (req, res) => {
  try {
    const Doctor = require("./models/Doctor");
    const User = require("./models/User");

    // Clear existing data
    await Doctor.deleteMany({});
    await User.deleteMany({});

    // Create doctors
    const doctors = [
      {
        name: "Dr. Rajesh Sharma",
        specialty: "Heart Surgeon",
        description:
          "An experienced heart surgeon specializing in minimally invasive cardiac procedures.",
        rating: 4.8,
        goodReviews: 91.5,
        totalScore: 95.3,
        satisfaction: 90.4,
        image: "assets/doctor_1.png",
        latitude: 28.6139,
        longitude: 77.209,
        address: "AIIMS, New Delhi, India",
      },
      {
        name: "Dr. Priya Mehta",
        specialty: "Neurology",
        description:
          "A leading neurologist with expertise in treating brain and nervous system disorders.",
        rating: 4.5,
        goodReviews: 88.3,
        totalScore: 90.1,
        satisfaction: 86.7,
        image: "assets/doctor_2.png",
        latitude: 19.076,
        longitude: 72.8777,
        address: "Lilavati Hospital, Mumbai, India",
      },
      {
        name: "Dr. Arun Verma",
        specialty: "Cardio Surgeon",
        description:
          "Highly skilled in performing complex cardiac surgeries and heart transplants.",
        rating: 4.6,
        goodReviews: 89.2,
        totalScore: 92.5,
        satisfaction: 87.8,
        image: "assets/doctor_3.png",
        latitude: 13.0827,
        longitude: 80.2707,
        address: "Apollo Hospitals, Chennai, India",
      },
      {
        name: "Dr. Sneha Kapoor",
        specialty: "Dermatology",
        description:
          "A renowned dermatologist specializing in skin rejuvenation and laser treatments.",
        rating: 4.7,
        goodReviews: 90.5,
        totalScore: 93.0,
        satisfaction: 89.3,
        image: "assets/doctor_4.png",
        latitude: 12.9716,
        longitude: 77.5946,
        address: "Fortis Hospital, Bangalore, India",
      },
      {
        name: "Dr. Aditya Malhotra",
        specialty: "Pediatrics",
        description:
          "A dedicated pediatrician providing comprehensive child healthcare services.",
        rating: 4.9,
        goodReviews: 93.1,
        totalScore: 96.2,
        satisfaction: 92.4,
        image: "assets/doctor_5.png",
        latitude: 22.5726,
        longitude: 88.3639,
        address: "AMRI Hospitals, Kolkata, India",
      },
      {
        name: "Dr. Ramesh Iyer",
        specialty: "Heart Surgeon",
        description:
          "Specialized in adult cardiac surgery, with years of experience in heart valve replacements.",
        rating: 4.6,
        goodReviews: 89.7,
        totalScore: 91.8,
        satisfaction: 88.2,
        image: "assets/doctor_6.png",
        latitude: 26.8467,
        longitude: 80.9462,
        address: "Medanta Hospital, Lucknow, India",
      },
      {
        name: "Dr. Aarti Nair",
        specialty: "Neurology",
        description:
          "Expert in neurodegenerative diseases, providing advanced treatments for brain disorders.",
        rating: 4.4,
        goodReviews: 87.5,
        totalScore: 89.9,
        satisfaction: 85.6,
        image: "assets/doctor_7.png",
        latitude: 17.385,
        longitude: 78.4867,
        address: "KIMS Hospital, Hyderabad, India",
      },
      {
        name: "Dr. Anil Chaturvedi",
        specialty: "Cardio Surgeon",
        description:
          "An acclaimed cardiac surgeon known for high success rates in bypass surgeries.",
        rating: 4.7,
        goodReviews: 90.8,
        totalScore: 93.5,
        satisfaction: 89.9,
        image: "assets/doctor_8.png",
        latitude: 23.2599,
        longitude: 77.4126,
        address: "Bansal Hospital, Bhopal, India",
      },
      {
        name: "Dr. Kavita Joshi",
        specialty: "Dermatology",
        description:
          "Highly experienced in cosmetic dermatology and skincare treatments.",
        rating: 4.5,
        goodReviews: 88.9,
        totalScore: 91.2,
        satisfaction: 87.4,
        image: "assets/doctor_9.png",
        latitude: 30.7333,
        longitude: 76.7794,
        address: "PGIMER, Chandigarh, India",
      },
      {
        name: "Dr. Rajiv Saxena",
        specialty: "Pediatrics",
        description: "An expert in neonatal care and childhood vaccinations.",
        rating: 4.8,
        goodReviews: 91.3,
        totalScore: 94.1,
        satisfaction: 90.7,
        image: "assets/doctor_10.png",
        latitude: 25.3176,
        longitude: 82.9739,
        address: "Sundaram Hospital, Varanasi, India",
      },
      {
        name: "Dr. Megha Singh",
        specialty: "General Physician",
        description:
          "A dedicated general physician focusing on preventive healthcare and internal medicine.",
        rating: 4.6,
        goodReviews: 89.4,
        totalScore: 91.7,
        satisfaction: 88.0,
        image: "assets/doctor_11.png",
        latitude: 9.9252,
        longitude: 78.1198,
        address: "Velammal Hospital, Madurai, India",
      },
      {
        name: "Dr. Suresh Patel",
        specialty: "Neurology",
        description:
          "Neuroscientist and clinician specializing in movement disorders and epilepsy.",
        rating: 4.3,
        goodReviews: 86.8,
        totalScore: 88.5,
        satisfaction: 84.2,
        image: "assets/doctor_12.png",
        latitude: 15.3173,
        longitude: 75.7139,
        address: "Manipal Hospital, Hubli, India",
      },
      {
        name: "Dr. Nidhi Sharma",
        specialty: "Dermatology",
        description:
          "Expert in skin disease management, cosmetic dermatology, and laser treatments.",
        rating: 4.5,
        goodReviews: 89.1,
        totalScore: 91.5,
        satisfaction: 87.7,
        image: "assets/doctor_13.png",
        latitude: 11.0168,
        longitude: 76.9558,
        address: "Ganga Hospital, Coimbatore, India",
      },
      {
        name: "Dr. Ashwin Desai",
        specialty: "Pediatrics",
        description:
          "Passionate about child health, specializing in pediatric infectious diseases.",
        rating: 4.7,
        goodReviews: 90.2,
        totalScore: 93.1,
        satisfaction: 89.5,
        image: "assets/doctor_14.png",
        latitude: 24.5854,
        longitude: 73.7125,
        address: "GBH American Hospital, Udaipur, India",
      },
    ];

    await Doctor.insertMany(doctors);

    res.json({ message: "Database seeded successfully" });
  } catch (error) {
    console.error("Error seeding database:", error.message);
    res.status(500).json({ error: `Error seeding database: ${error.message}` });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API Docs available at http://localhost:${PORT}/api/docs`);
});
