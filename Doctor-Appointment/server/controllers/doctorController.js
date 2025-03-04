const Doctor = require("../models/Doctor");
const geolib = require("geolib");

exports.getDoctors = async (req, res) => {
  try {
    const { specialty, latitude, longitude } = req.query;
    const query = {};

    if (specialty) {
      query.specialty = specialty;
    }

    const doctors = await Doctor.find(query);

    let sortedDoctors = doctors.map((doctor) => doctor.toObject());

    // Calculate distance if coordinates provided
    if (latitude && longitude) {
      sortedDoctors = sortedDoctors.map((doctor) => ({
        ...doctor,
        distance:
          doctor.latitude && doctor.longitude
            ? geolib.getDistance(
                { latitude, longitude },
                { latitude: doctor.latitude, longitude: doctor.longitude }
              ) / 1000 // Convert to kilometers
            : null,
      }));

      // Sort by distance
      sortedDoctors.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    res.json(sortedDoctors);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to fetch doctors", error: error.message });
  }
};

exports.getDoctorDetails = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    res.status(400).json({
      message: "Failed to fetch doctor details",
      error: error.message,
    });
  }
};

exports.getDoctorAvailability = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    // Generate time slots (9 AM to 5 PM, 30-minute intervals)
    const availableSlots = [];
    let currentHour = 9; // 9 AM

    while (currentHour < 17) {
      // 5 PM
      let hour = currentHour;
      let minute = 0;

      for (let i = 0; i < 2; i++) {
        // Two 30-minute slots per hour
        const startTime = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        minute += 30;

        if (minute === 60) {
          hour += 1;
          minute = 0;
        }

        const endTime = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        availableSlots.push({
          start_time: startTime,
          end_time: endTime,
        });
      }

      currentHour = hour;
    }

    res.json(availableSlots);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to get availability", error: error.message });
  }
};
