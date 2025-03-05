# Doctor Appointment System - Test Document

## 1. Introduction

**Purpose:** This document outlines the test plan for evaluating the Doctor Appointment System, focusing on authentication, doctor management, appointment booking, and notification services.

**Scope:** Testing covers core functionality, including user authentication, doctor retrieval, appointment scheduling, cancellation, and notifications.

**Target Audience:** QA Engineers, Developers

## 2. Requirements

| Requirement ID | Description |
|---------------|-------------|
| REQ-1 | The system shall allow users to register and authenticate using OTP verification. |
| REQ-2 | The system shall allow users to fetch the list of available doctors. |
| REQ-3 | The system shall allow users to book an appointment with a doctor. |
| REQ-4 | The system shall allow users to cancel an appointment. |
| REQ-5 | The system shall send appointment confirmation and reminder notifications. |

## 3. Manual Test Cases

| Test Case ID | Description | Test Steps | Expected Result | Pass/Fail | Notes |
|-------------|-------------|------------|----------------|-----------|-------|
| TC-1.1 | Verify user registration. | 1. Enter valid details (name, phone, email) and submit the form. | OTP should be sent to the registered email. | Passed | User should receive an OTP within a few seconds. |
| TC-1.2 | Verify OTP-based login. | 1. Enter registered phone number. 2. Enter the received OTP. 3. Click login. | User should be authenticated successfully. | Passed | Ensure OTP expires after a set time. |
| TC-2.1 | Verify doctor retrieval. | 1. Request the list of doctors via API. | The API should return a list of available doctors. | Passed | Ensure that only active doctors are listed. |
| TC-3.1 | Verify appointment booking. | 1. Select a doctor. 2. Choose date and time. 3. Confirm booking. | The appointment should be successfully booked. | Passed | Ensure no double-booking for the same time slot. |
| TC-4.1 | Verify appointment cancellation. | 1. Navigate to 'My Appointments'. 2. Select an appointment. 3. Click 'Cancel'. | The appointment should be canceled successfully. | Passed | Verify cancellation policies (e.g., 24-hour notice). |
| TC-5.1 | Verify email notification for appointment confirmation. | 1. Book an appointment. 2. Check registered email. | Confirmation email should be received. | Passed | Ensure email contains appointment details. |

## 4. Automated API Test Cases

These tests use Jest and Supertest for API validation.

### 4.1 Authentication API Tests

```javascript
const request = require('supertest');
const app = require('../server');

describe('Authentication API Tests', () => {
  test('Register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ firstName: 'John', lastName: 'Doe', phone: '9876543210', email: 'john.doe@example.com' });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('OTP sent successfully to your email');
  });
});
```

### 4.2 Appointment API Tests

```javascript
describe('Appointment API Tests', () => {
  test('Book an appointment', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .send({ doctorId: '65fa1234abcd5678ef901234', patientId: '65fa5678abcd9012ef345678', appointmentDate: '2025-03-10', startTime: '10:00' })
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('appointment');
  });
});
```

## 5. Test Environment

- **Backend Server:** Node.js with Express
- **Database:** MongoDB
- **Email Service:** Nodemailer (Gmail SMTP)

