const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const nodemailer = require("nodemailer");

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
    await appointment.populate("doctorId", "name specialty address");
    await appointment.populate("patientId", "firstName lastName email");

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

    // Send confirmation email
    try {
      if (appointment.patientId.email) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
          },
        });

        // Format the appointment date
        const appointmentDateFormatted = new Date(
          appointmentDate
        ).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: appointment.patientId.email,
          subject: "MediAlert - Appointment Confirmation",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #8873f4; text-align: center;">MediAlert</h2>
              <p>Hello ${appointment.patientId.firstName} ${
            appointment.patientId.lastName
          },</p>
              <p>Your appointment has been successfully booked!</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Doctor:</strong> ${appointment.doctorId.name}</p>
                <p><strong>Specialty:</strong> ${
                  appointment.doctorId.specialty
                }</p>
                <p><strong>Date:</strong> ${appointmentDateFormatted}</p>
                <p><strong>Time:</strong> ${appointment.startTime} - ${
            appointment.endTime
          }</p>
                <p><strong>Address:</strong> ${appointment.doctorId.address}</p>
              </div>
              <p><strong>Directions:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                appointment.doctorId.address
              )}">Get directions on Google Maps</a></p>
              <p>Please arrive 10 minutes before your scheduled appointment time.</p>
              <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
              <p>Best regards,<br>The MediAlert Team</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(
          `Appointment confirmation sent to ${appointment.patientId.email}`
        );
      }
    } catch (emailError) {
      console.error("Email error:", emailError);
      // Continue execution even if email fails
    }

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
