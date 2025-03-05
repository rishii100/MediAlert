/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management
 */

const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const auth = require("../middleware/auth");
const Appointment = require("../models/Appointment"); // Import the Appointment model

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - patientId
 *               - appointmentDate
 *               - startTime
 *             properties:
 *               doctorId:
 *                 type: string
 *               patientId:
 *                 type: string
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized - User not logged in
 */
router.post("/", auth, appointmentController.bookAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update an appointment status
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       404:
 *         description: Appointment not found
 *       401:
 *         description: Unauthorized - User not logged in
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if the user is the patient who made the appointment
    if (appointment.patientId.toString() !== req.userId) {
      return res.status(403).json({
        message: "Unauthorized - You can only update your own appointments",
      });
    }

    appointment.status = status;
    await appointment.save();

    // Populate doctor and patient information
    await appointment.populate("doctorId", "name");
    await appointment.populate("patientId", "firstName lastName");

    // Format the response
    const response = {
      id: appointment._id,
      doctorId: appointment.doctorId._id,
      doctorName: appointment.doctorId.name,
      patientId: appointment.patientId._id,
      patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      createdAt: appointment.createdAt,
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating appointment:", error.message);
    res
      .status(400)
      .json({ message: "Failed to update appointment", error: error.message });
  }
});

/**
 * @swagger
 * /api/appointments/check-auth:
 *   get:
 *     summary: Check if user is authenticated
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated
 *       401:
 *         description: User is not authenticated
 */
router.get("/check-auth", auth, (req, res) => {
  res.status(200).json({
    authenticated: true,
    userId: req.userId,
  });
});

module.exports = router;
