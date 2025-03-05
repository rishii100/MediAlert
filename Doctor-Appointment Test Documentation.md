## Manual Test Cases Document

### Project: Doctor Appointment System

#### 1. Login Functionality

| Test Case ID | Test Scenario | Steps to Execute | Expected Result | Actual Result | Status |
|-------------|--------------|------------------|----------------|---------------|--------|
| TC001 | Verify login with valid credentials | 1. Navigate to login page 2. Enter valid email and password 3. Click 'Login' | User should be logged in successfully | Login successful | Passed |
| TC002 | Verify login with invalid credentials | 1. Enter invalid email or password 2. Click 'Login' | Error message should be displayed | Error message displayed | Passed |

#### 2. Doctor Appointment Booking

| Test Case ID | Test Scenario | Steps to Execute | Expected Result | Actual Result | Status |
|-------------|--------------|------------------|----------------|---------------|--------|
| TC003 | Verify doctor search functionality | 1. Enter doctor name/specialty in search bar 2. Click 'Search' | Matching doctors should be displayed | Doctors displayed | Passed |
| TC004 | Verify appointment booking | 1. Select a doctor 2. Choose date and time 3. Confirm booking | Appointment should be booked successfully | Appointment booked | Passed |
| TC005 | Verify appointment cancellation | 1. Navigate to 'My Appointments' 2. Select an appointment 3. Click 'Cancel' | Appointment should be cancelled | Appointment cancelled | Passed |

#### 3. Profile Management

| Test Case ID | Test Scenario | Steps to Execute | Expected Result | Actual Result | Status |
|-------------|--------------|------------------|----------------|---------------|--------|
| TC006 | Verify user profile update | 1. Navigate to 'Profile' 2. Edit name, phone, etc. 3. Save changes | Profile should be updated successfully | Profile updated | Passed |

#### 4. Notifications & Reminders

| Test Case ID | Test Scenario | Steps to Execute | Expected Result | Actual Result | Status |
|-------------|--------------|------------------|----------------|---------------|--------|
| TC007 | Verify email notification for appointment confirmation | 1. Book an appointment 2. Check registered email | Confirmation email should be received | Email received | Passed |
| TC008 | Verify push notifications for upcoming appointments | 1. Schedule an appointment 2. Wait until 30 mins before appointment time | Notification should be received | Notification received | Passed |

#### 5. API Error Handling

| Test Case ID | Test Scenario | Steps to Execute | Expected Result | Actual Result | Status |
|-------------|--------------|------------------|----------------|---------------|--------|
| TC009 | Verify system response for an unavailable doctor slot | 1. Try to book an appointment on an already occupied slot | Error message should be displayed | Error displayed | Passed |
| TC010 | Verify API response when an unauthorized user tries to book an appointment | 1. Send a booking request without authentication | 401 Unauthorized error should be returned | Unauthorized error displayed | Passed |

---

## Automated API Test Cases

```javascript
const request = require('supertest');
const app = require('../app');

describe('Authentication APIs', () => {
  test('TC001 - Register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ firstName: 'John', lastName: 'Doe', phone: '65fa1234abcd5678ef9012347890', email: 'john.doe@example.com' });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('OTP sent successfully to your email');
  });

  test('TC002 - Send OTP for login', async () => {
    const response = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '65fa1234abcd5678ef9012347890' });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('OTP sent successfully to your email');
  });

  test('TC003 - Verify OTP and Login', async () => {
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: '65fa1234abcd5678ef9012347890', otp: '65fa1234abcd5678ef901234' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});

describe('Doctor APIs', () => {
  test('TC004 - Fetch all doctors', async () => {
    const response = await request(app).get('/api/doctors');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('TC005 - Fetch doctor by ID', async () => {
    const response = await request(app).get('/api/doctors/65fa1234abcd5678ef901234');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name');
  });
});

describe('Appointment APIs', () => {
  test('TC006 - Book an appointment', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .send({ doctorId: '65fa1234abcd5678ef901234', patientId: '65fa5678abcd9012ef345678', appointmentDate: '2025-03-10', startTime: '10:00' })
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('appointment');
  });

  test('TC007 - Cancel an appointment', async () => {
    const response = await request(app)
      .delete('/api/appointments/65fa1234abcd5678ef901234')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Appointment cancelled successfully');
  });
});

describe('Notification APIs', () => {
  test('TC009 - Send appointment reminder', async () => {
    const response = await request(app)
      .post('/api/notifications/send-reminder')
      .send({ appointmentId: '65fa1234abcd5678ef901234' });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Reminder sent successfully');
  });
});
