# Veersa Hackathon 2025 - MediAlert

Welcome to our project repository for the **Veersa Hackathon 2025**! We are tackling two critical use cases in the healthcare industry:

1. **Use Case 1: Adverse Medical Event Prediction from a Phone Call**
2. **Use Case 3: Mobile Application for Scheduling Appointments**

Our goal is to provide a seamless experience for both **patients** and **doctors** by leveraging modern technologies to solve real-world healthcare challenges.

---
## Submission Details

### Hosted Links
- **Doctor Dashboard:** [Vercel Deployment](https://adverse-event-detection-host.vercel.app)
- **Patient Mobile App Figma Design:** [Figma Design](https://www.figma.com/proto/TdOuVyQ9TKeTL9KBBCp7wb/WebDesign?node-id=11-343&t=1t2yUjlGP499ruZ8-1&starting-point-node-id=11%3A343)
- **Video Presentation:** [Youtube Video](https://youtu.be/0UjOlSE_QZE)
  
### Test Cases
- **Adverse Event Detection Test Cases:** `Adverse Event Detection Test Document.md`
- **Doctor Appointment Test Cases:** `Doctor-Appointment Test Documentation.md`


### Team Members
- **Nikhil Dixit** - Web Application
- **Anirban Saha** - AI/ML
- **Dibek Todi** - Mobile Application
- **Ravish Gupta** - Figma Design
---

## Project Overview

### Use Case 1: Adverse Medical Event Prediction
**Problem Statement:**  
Millions of conversations happen daily between medical agents/nurses and patients regarding medical conditions and medications. Often, there are subtle indications of adverse events that go unnoticed. Our solution aims to **predict and flag potential adverse events** from recorded conversations to prevent or remediate them quickly.

**Key Features:**
- **Conversation Analysis:** Analyze recorded conversations using **Deepgram** for transcription and **AWS Comprehend Medical** for NLP-based risk detection.
- **AI/ML Processing Layer:** Integrate machine learning models to predict adverse events based on FDA's adverse event repository data.
- **User-Friendly Dashboard:** A **React.js** and **TailwindCSS** based web dashboard for doctors to upload audio, view predictions, and generate reports.

# AI-Powered Adverse Event Detection & Doctor Appointment Booking System

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

![Project Architecture](https://github.com/user-attachments/assets/179db5f3-077f-4e0c-a11a-472fd8d9c63c)


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
- **Database:** MongoDB 
- **AI/NLP:** AWS Comprehend Medical, Deepgram
- **Authentication:** JWT, Firebase Authentication
- **Notifications:** Firebase Cloud Messaging, Nodemailer
- **Deployment:** Vercel (Web), Render (Backend)

---

### License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.



