/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management
 */

const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

/**
 * @swagger
 * /api/notifications/send-reminder:
 *   post:
 *     summary: Send an appointment reminder
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reminder sent successfully
 *       404:
 *         description: Appointment not found
 */
router.post("/send-reminder", notificationController.sendAppointmentReminder);

module.exports = router;
