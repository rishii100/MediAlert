# Adverse Medical Event Prediction - Test Document

## 1. Introduction

**Purpose:** This document outlines the test plan for evaluating a solution designed to predict adverse medical events from phone call recordings.

**Scope:** Testing covers core functionality: audio transcription, medical entity extraction, risk assessment, and API interactions.

**Target Audience:** QA Engineers, Developers

## 2. Requirements

| Requirement ID | Description |
|---------------|-------------|
| REQ-1 | The system shall accurately transcribe audio recordings. |
| REQ-2 | The system shall extract relevant medical entities from the transcribed text. |
| REQ-3 | The system shall assess the risk level (Low, Moderate, High) of an adverse event. |
| REQ-4 | The system shall integrate with the FDA API to identify potential adverse events. |
| REQ-5 | The system shall provide a risk score (0-100%) indicating the likelihood of an adverse event. |
| REQ-6 | The system should not allow more than 7000 characters in the transcript. |

## 3. Manual Test Cases

| Test Case ID | Description | Test Steps | Expected Result | Pass/Fail | Notes |
|-------------|-------------|------------|----------------|-----------|-------|
| TC-1.1 | Verify successful transcription. | 1. Upload a clear audio file. | Transcription should accurately reflect the content of the audio. | | Use an audio file with minimal background noise. |
| TC-2.1 | Verify extraction of medical conditions. | 1. Upload/input a transcription containing mentions of medical conditions (e.g., "diabetes," "hypertension"). | The system should correctly identify and extract "diabetes" and "hypertension" as medical conditions. | | Verify that common medical conditions are accurately extracted. |
| TC-3.1 | Verify "High" risk level assignment. | 1. Upload/input a transcription containing multiple high-risk conditions and FDA-matched events. | The system should assign a "High" risk level and a risk score >= 70%. | | This test verifies that the system correctly identifies a high-risk scenario when multiple factors are present. |
| TC-3.2 | Verify FDA API integration. | 1. Upload/input a transcription containing terms that should match adverse event reactions in the FDA API. | The system should successfully query the FDA API and identify matching adverse events. The `fdaMatches` array in the response should contain relevant information about the matched events. | | This test verifies that the system can successfully communicate with the FDA API and retrieve relevant data. |
| TC-6.1 | Verify that the maximum characters are restricted to 7000 characters. | 1. Upload a transcription. | The system should restrict the number of characters in the transcription to 7000. | | This tests that the limit of 7000 characters is being applied to the system. |

## 4. Automated API Test Cases

These tests will use a testing framework like Jest or Mocha with a library like Supertest to make HTTP requests to the backend API.

### 4.1 Transcription API Tests (`/api/upload`)

```javascript
// Example using Jest and Supertest
const request = require('supertest');
const app = require('../app'); 
const fs = require('fs');

describe('Transcription API (/api/upload)', () => {
  it('should transcribe a valid audio file', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('audio', fs.readFileSync('path/to/valid_audio.mp3'), 'valid_audio.mp3') 
      .expect(200);

    expect(response.body).toHaveProperty('transcription');
    expect(response.body.transcription).toBeDefined();
  });

  it('should return an error for an invalid audio file', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('audio', fs.readFileSync('path/to/invalid_file.txt'), 'invalid_file.txt') 
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('No file uploaded'); 
  });
});
```

### 4.2 Analysis API Tests (`/api/analyze`)

```javascript
const request = require('supertest');
const app = require('../app');

describe('Analysis API (/api/analyze)', () => {
  it('should analyze a valid transcription', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({
        patientName: 'John Doe',
        transcription: 'The patient reports chest pain and shortness of breath.'
      })
      .expect(200);

    expect(response.body).toHaveProperty('riskLevel');
    expect(response.body).toHaveProperty('riskScore');
    expect(response.body).toHaveProperty('extractedEntities');
  });

  it('should return an error if no transcription is provided', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({ patientName: 'John Doe' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('No transcription provided'); 
  });
});
```

## 5. Test Environment

- **Backend Server:** Node.js with Express
- **AWS Account:** Configured for Comprehend Medical.
- **FDA API Key:** Valid API key.