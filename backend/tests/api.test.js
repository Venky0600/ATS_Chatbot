const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const http = require('http');
const { connectDB } = require('../src/config/database');

let server;
let baseUrl;
let token;

test.before(async () => {
  await connectDB();
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, async () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;

      // Create test auth user & token
      const authRes = await fetch(`${baseUrl}/api/v1/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 'test_user_main@example.com' })
      });
      const authData = await authRes.json();
      token = authData.data.accessToken;

      resolve();
    });
  });
});

const mongoose = require('mongoose');

test.after(async () => {
  if (server) server.close();
  try {
    await mongoose.disconnect();
  } catch (_) {}
});

test('1. GET /health returns status UP', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.status, 'UP');
});

test('2. Resume Upload TXT -> 201 Created & Parsed', async () => {
  const form = new FormData();
  const blob = new Blob(['John Doe\nSoftware Engineer\nSkills: Flutter, Dart, Firebase'], { type: 'text/plain' });
  form.append('file', blob, 'resume_sample.txt');

  const res = await fetch(`${baseUrl}/api/v1/resumes`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.resume.fileName, 'resume_sample.txt');
  assert.equal(data.data.resume.status, 'processed');
});

test('3. Resume Upload Empty File (0 bytes) -> 400 Bad Request', async () => {
  const form = new FormData();
  const blob = new Blob([], { type: 'text/plain' });
  form.append('file', blob, 'empty_resume.txt');

  const res = await fetch(`${baseUrl}/api/v1/resumes`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.error.code, 'VALIDATION_ERROR');
});

test('4. Resume Upload Unsupported File (.png) -> 415 Unsupported Media Type', async () => {
  const form = new FormData();
  const blob = new Blob(['fake_image_bytes'], { type: 'image/png' });
  form.append('file', blob, 'image.png');

  const res = await fetch(`${baseUrl}/api/v1/resumes`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
  });

  assert.equal(res.status, 415);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.error.code, 'UNSUPPORTED_FILE_TYPE');
});

test('5. End-to-End API Journey: Auth -> Resume -> JD -> Analysis -> Security Ownership', async () => {
  // 1. Fetch User Profile
  const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.equal(meRes.status, 200);
  const meData = await meRes.json();
  assert.equal(meData.success, true);

  // 2. Create Job Description
  const jdRes = await fetch(`${baseUrl}/api/v1/job-descriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Senior Flutter Developer',
      company: 'Tech Corp',
      rawText: 'Looking for a Senior Flutter Developer with experience in Flutter, Dart, Firebase, REST API, Node.js, and Docker.'
    })
  });
  assert.equal(jdRes.status, 201);
  const jdData = await jdRes.json();
  const jdId = jdData.data.jobDescription.id;
  assert.ok(jdId);

  // 3. Upload Resume
  const resumeFormData = new FormData();
  const blob = new Blob(['John Doe\nFlutter Developer\nSkills: Flutter, Dart, Firebase, REST API, MongoDB'], { type: 'text/plain' });
  resumeFormData.append('file', blob, 'resume_sample.txt');

  const resumeRes = await fetch(`${baseUrl}/api/v1/resumes`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: resumeFormData
  });
  assert.equal(resumeRes.status, 201);
  const resumeData = await resumeRes.json();
  const resumeId = resumeData.data.resume.id;
  assert.ok(resumeId);

  // 4. Create Analysis
  const analysisRes = await fetch(`${baseUrl}/api/v1/analyses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ resumeId, jobDescriptionId: jdId })
  });
  assert.equal(analysisRes.status, 201);
  const analysisData = await analysisRes.json();
  assert.equal(analysisData.success, true);
  const analysisId = analysisData.data.analysis.id;
  assert.ok(analysisId);
  assert.ok(analysisData.data.analysis.scores.overallMatch >= 0);

  // 5. Security Ownership Check: User B cannot access User A's Analysis
  const authResB = await fetch(`${baseUrl}/api/v1/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: 'test_google_token_user_b@example.com' })
  });
  const tokenB = (await authResB.json()).data.accessToken;

  const forbiddenRes = await fetch(`${baseUrl}/api/v1/analyses/${analysisId}`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert.equal(forbiddenRes.status, 404);
});
