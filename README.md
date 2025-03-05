# MediAlert

## Overview
This project integrates two innovative healthcare solutions into one platform:
1. **Adverse Medical Event Prediction from Phone Calls:** Leverages AI and NLP to analyze patient-doctor conversations, detect early signs of potential adverse events, and generate actionable risk reports for healthcare providers.
2. **Doctor Appointment Booking System:** Provides a seamless, user-friendly mobile app for patients to book appointments, view doctor availability, and receive confirmation and reminder notifications.

By combining these functionalities, our platform improves patient safety through early detection and streamlines access to quality healthcare.

## Problem Statement
- **Early Medical Intervention:** Many adverse events go undetected until they escalate, causing severe consequences.
- **Inefficient Appointment Scheduling:** Traditional booking systems often lead to double bookings, delays, and inefficiencies.
Our solution addresses these challenges with advanced AI-driven analysis and an intuitive appointment system.

## Features
- **AI-Powered Analysis:**
  - Converts audio conversations to text using Deepgram.
  - Analyzes text with AWS Comprehend Medical to detect potential adverse events.
  - Generates detailed risk reports for healthcare providers.
- **Doctor Dashboard:**
  - Web-based interface built with React.js and TailwindCSS.
  - Secure login and data management.
  - Visualization of risk analysis and downloadable reports.
- **Appointment Booking System:**
  - Flutter-based mobile app for easy booking.
  - Real-time scheduling with conflict resolution.
  - Geo-location services to locate nearby doctors.
  - Automated email confirmations and reminder notifications.

## System Architecture
The system is divided into two main modules:

### Doctor Dashboard
- **Frontend:** Built with React.js and TailwindCSS, deployed on Vercel for a responsive web interface.
- **Backend:** A Node.js and Express server handles API requests, user authentication (JWT), and integration with AI services.
- **AI Processing:** 
  - **Deepgram API** converts patient call audio to text.
  - **AWS Comprehend Medical** analyzes the text to extract medical insights and detect adverse events.
  - An AI/ML layer processes and cross-references data (e.g., FDA guidelines) to generate detailed risk reports.
- **Database:** MongoDB stores user profiles, doctor details, and risk reports.

### Appointment Booking Module
- **Mobile App:** Developed in Flutter for cross-platform compatibility, allowing patients to search for doctors, book appointments, and view schedules.
- **Backend Integration:** The same Node.js server handles appointment scheduling, preventing double bookings and managing real-time data.
- **Notifications:** Real-time notifications are sent via Firebase Cloud Messaging, and email confirmations/reminders are managed by Nodemailer or SendGrid.
- **Geo-Location:** Utilizes geo-location APIs to assist patients in finding nearby doctors.

## Tech Stack
- **Frontend (Web):** React.js, TailwindCSS
- **Mobile App:** Flutter
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (
- **AI/NLP:** AWS Comprehend Medical, Deepgram
- **Authentication:**  Firebase Authentication
- **Notifications:** Firebase Cloud Messaging, Nodemailer
- **Deployment:** Vercel (Web), Render (Backend)

## Setup Instructions
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/yourproject.git
   cd yourproject
   ```
2. **Backend Setup:**
   - Navigate to the backend folder:
     ```bash
     cd backend
     npm install
     npm start
     ```
   - Configure environment variables in a `.env` file (e.g., API keys, MongoDB URI).
3. **Frontend Setup (Doctor Dashboard):**
   - Navigate to the frontend folder:
     ```bash
     cd ../frontend
     npm install
     npm start
     ```
4. **Mobile App Setup:**
   - Navigate to the Flutter project folder:
     ```bash
     cd ../mobile_app
     flutter pub get
     flutter run
     ```

## Deployment
- **Frontend:** Deploy on Vercel.
- **Backend:** Deploy on Render or Heroku.
- **Database:** Host on MongoDB Atlas.
- **Mobile App:** Build APKs/iOS builds using Flutter’s build tools.

## Testing
- **Manual Testing:** Refer to our documented test cases to validate all functionalities.
- **Automated Testing:** Unit tests and API tests are available in the `/tests` directory.

## Contribution Guidelines
- Fork the repository and create a branch for your feature or bug fix.
- Follow the coding standards and commit message conventions as outlined in our contributing guide.
- Submit pull requests and ensure all tests pass before merging.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

