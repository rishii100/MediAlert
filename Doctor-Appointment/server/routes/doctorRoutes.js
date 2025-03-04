/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management
 */

const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all doctors or filter by specialty
 *     tags: [Doctors]
 *     parameters:
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Doctor specialty
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: User latitude
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: User longitude
 *     responses:
 *       200:
 *         description: List of doctors
 */
router.get("/", doctorController.getDoctors);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get a doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor details
 *       404:
 *         description: Doctor not found
 */
router.get("/:id", doctorController.getDoctorDetails);

/**
 * @swagger
 * /api/doctors/{id}/availability:
 *   get:
 *     summary: Get a doctor's availability for a specific date
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Doctor ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Available time slots
 *       400:
 *         description: Invalid request
 */
router.get("/:id/availability", doctorController.getDoctorAvailability);

module.exports = router;
