const Appointment = require("../models/Appointment");
const User = require("../models/User");
const twilio = require("twilio");

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendAppointmentReminder = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate("doctorId", "name")
      .populate("patientId", "firstName lastName phone");

    if (!appointment || !appointment.patientId) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Format the appointment date
    const appointmentDate = new Date(
      appointment.appointmentDate
    ).toLocaleDateString();

    // Send SMS reminder if phone number is available
    if (appointment.patientId.phone) {
      try {
        await client.messages.create({
          body: `Reminder: Your appointment with ${appointment.doctorId.name} is scheduled for ${appointmentDate} at ${appointment.startTime}.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: appointment.patientId.phone,
        });

        console.log(`Reminder sent to ${appointment.patientId.phone}`);
      } catch (twilioError) {
        console.error("Twilio error:", twilioError);
        // Continue execution even if Twilio fails
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
      .populate("patientId", "firstName lastName phone deviceToken");

    console.log(`Found ${upcomingAppointments.length} upcoming appointments`);

    // Send reminders for each appointment
    for (const appointment of upcomingAppointments) {
      if (appointment.patientId && appointment.patientId.phone) {
        try {
          await client.messages.create({
            body: `Reminder: Your appointment with ${appointment.doctorId.name} is in 1 hour.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: appointment.patientId.phone,
          });

          console.log(
            `Automatic reminder sent to ${appointment.patientId.phone}`
          );
        } catch (twilioError) {
          console.error("Twilio error:", twilioError);
        }
      }
    }

    return upcomingAppointments.length;
  } catch (error) {
    console.error("Error checking upcoming appointments:", error);
    return 0;
  }
};
