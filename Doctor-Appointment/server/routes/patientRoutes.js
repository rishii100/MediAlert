/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management
 */

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Create or update a patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               deviceToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       201:
 *         description: Patient created successfully
 *       400:
 *         description: Invalid request
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, deviceToken } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Split name into firstName and lastName
    const nameParts = name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Check if user exists by email (using phone as a unique identifier)
    let user = await User.findOne({ phone });

    if (user) {
      // Update existing user
      user.firstName = firstName;
      user.lastName = lastName;
      user.deviceToken = deviceToken;

      await user.save();

      return res.status(200).json(user);
    } else {
      // Create new user
      user = new User({
        firstName,
        lastName,
        phone,
        deviceToken,
      });

      await user.save();

      return res.status(201).json(user);
    }
  } catch (error) {
    console.error("Error creating/updating patient:", error.message);
    res.status(400).json({
      message: "Failed to create/update patient",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/patients/{patientId}/appointments:
 *   get:
 *     summary: Get all appointments for a patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         schema:
 *           type: string
 *         required: true
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: List of appointments
 *       404:
 *         description: Patient not found
 *       403:
 *         description: Unauthorized - Can only view your own appointments
 */
router.get("/:patientId/appointments", auth, async (req, res) => {
  try {
    const patientId = req.params.patientId;

    // Verify that the authenticated user is the same as the patient
    if (req.userId !== patientId) {
      return res.status(403).json({
        message: "Unauthorized - You can only view your own appointments",
      });
    }

    // Check if patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Get all appointments for the patient
    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "name specialty")
      .sort({ appointmentDate: 1, startTime: 1 });

    // Format the response to match the expected format
    const formattedAppointments = appointments.map((appointment) => {
      return {
        id: appointment._id,
        doctorId: appointment.doctorId._id,
        doctorName: appointment.doctorId.name,
        patientId: appointment.patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        appointmentDate: appointment.appointmentDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        createdAt: appointment.createdAt,
      };
    });

    res.json(formattedAppointments);
  } catch (error) {
    console.error("Error getting appointments:", error.message);
    res
      .status(400)
      .json({ message: "Failed to get appointments", error: error.message });
  }
});

module.exports = router;
