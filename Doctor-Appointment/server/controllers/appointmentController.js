const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, appointmentDate, startTime } = req.body;

    // Validate required fields
    if (!doctorId || !patientId || !appointmentDate || !startTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify that the authenticated user is the same as the patient
    if (req.userId !== patientId) {
      return res.status(403).json({
        message: "Unauthorized - You can only book appointments for yourself",
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      startTime,
    });

    if (conflictingAppointment) {
      return res
        .status(400)
        .json({ message: "Appointment slot not available" });
    }

    // Calculate end time (30 minutes after start)
    const [hours, minutes] = startTime.split(":").map(Number);
    let endHour = hours;
    let endMinute = minutes + 30;

    if (endMinute >= 60) {
      endHour += 1;
      endMinute -= 60;
    }

    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    // Create appointment
    const appointment = new Appointment({
      doctorId,
      patientId,
      appointmentDate,
      startTime,
      endTime,
      status: "scheduled",
    });

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

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: response,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to book appointment", error: error.message });
  }
};
