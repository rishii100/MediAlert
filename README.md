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

### Use Case 3: Mobile Application for Scheduling Appointments
**Problem Statement:**  
With the increasing need for accessible healthcare, patients often struggle to book appointments with doctors. Our solution provides a **mobile application** that allows patients to **find, book, and manage appointments** with doctors seamlessly.

**Key Features:**
- **Find Doctors:** Patients can search for doctors based on specialty and location, sorted by the shortest distance using **Google Location API**.
- **Real-Time Notifications:** Patients receive **confirmation emails** and **real-time reminders** via **SMTP Server** and **Nodemailer**.
- **Prevent Double Booking:** Ensures no conflicting appointments are scheduled for doctors or patients.
- **Flutter App:** A cross-platform mobile app built with **Flutter** for a smooth user experience.

---

## Tech Stack

### Frontend
- **React.js & TailwindCSS** (Doctor Dashboard - Adverse Medical Event Prediction)
- **Flutter** (Patient Mobile App - for Scheduling Appointments)

### Backend
- **Node.js & Express** (RESTful APIs)
- **MongoDB** (Database)

### AI/ML Integration
- **Deepgram** (Audio Transcription)
- **AWS Comprehend Medical** (NLP for Adverse Event Detection)
- **Google Location API** (Distance Calculation)

### Deployment
- **Vercel** (Frontend Deployment)
- **Render** (Backend Deployment)
- **Firebase** (User Authentication)

### Other Tools
- **Nodemailer** (Email Notifications)
- **Geo Locator** (Location-Based Sorting)
- **SMTP Server** (Real-Time Notifications)

---

### Architecture Diagram
![Project Architecture](https://github.com/user-attachments/assets/179db5f3-077f-4e0c-a11a-472fd8d9c63c)



