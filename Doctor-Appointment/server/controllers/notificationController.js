const Appointment = require("../models/Appointment");
const User = require("../models/User");
const nodemailer = require("nodemailer");

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

exports.sendAppointmentReminder = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate("doctorId", "name")
      .populate("patientId", "firstName lastName email");

    if (!appointment || !appointment.patientId) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Format the appointment date
    const appointmentDate = new Date(
      appointment.appointmentDate
    ).toLocaleDateString();

    // Send email reminder if email is available
    if (appointment.patientId.email) {
      try {
        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: appointment.patientId.email,
          subject: "MediAlert - Appointment Reminder",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #8873f4; text-align: center;">MediAlert</h2>
              <p>Hello ${appointment.patientId.firstName} ${appointment.patientId.lastName},</p>
              <p>This is a reminder for your upcoming appointment:</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Doctor:</strong> ${appointment.doctorId.name}</p>
                <p><strong>Date:</strong> ${appointmentDate}</p>
                <p><strong>Time:</strong> ${appointment.startTime}</p>
              </div>
              <p>Please arrive 10 minutes before your scheduled appointment time.</p>
              <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
              <p>Best regards,<br>The MediAlert Team</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Reminder sent to ${appointment.patientId.email}`);
      } catch (emailError) {
        console.error("Email error:", emailError);
        // Continue execution even if email fails
      }
    }

    res.json({ message: "Reminder sent successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to send reminder", error: error.message });
  }
};

// Function to check upcoming appointments and send reminders
exports.checkUpcomingAppointments = async () => {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Find appointments happening in the next hour
    const upcomingAppointments = await Appointment.find({
      appointmentDate: {
        $gte: now,
        $lte: oneHourFromNow,
      },
      status: "scheduled",
    })
      .populate("doctorId", "name")
      .populate("patientId", "firstName lastName email deviceToken");

    console.log(`Found ${upcomingAppointments.length} upcoming appointments`);

    // Send reminders for each appointment
    for (const appointment of upcomingAppointments) {
      if (appointment.patientId && appointment.patientId.email) {
        try {
          const appointmentDate = new Date(
            appointment.appointmentDate
          ).toLocaleDateString();

          const mailOptions = {
            from: process.env.GMAIL_USER,
            to: appointment.patientId.email,
            subject: "MediAlert - Upcoming Appointment Reminder",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #8873f4; text-align: center;">MediAlert</h2>
                <p>Hello ${appointment.patientId.firstName} ${appointment.patientId.lastName},</p>
                <p>Your appointment with ${appointment.doctorId.name} is in 1 hour.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <p><strong>Doctor:</strong> ${appointment.doctorId.name}</p>
                  <p><strong>Date:</strong> ${appointmentDate}</p>
                  <p><strong>Time:</strong> ${appointment.startTime}</p>
                </div>
                <p>Please arrive 10 minutes before your scheduled appointment time.</p>
                <p>Best regards,<br>The MediAlert Team</p>
              </div>
            `,
          };

          await transporter.sendMail(mailOptions);
          console.log(
            `Automatic reminder sent to ${appointment.patientId.email}`
          );
        } catch (emailError) {
          console.error("Email error:", emailError);
        }
      }
    }

    return upcomingAppointments.length;
  } catch (error) {
    console.error("Error checking upcoming appointments:", error);
    return 0;
  }
};
