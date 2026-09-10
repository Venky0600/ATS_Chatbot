const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const http = require('http');

let server;
let baseUrl;

const { connectDB } = require('../src/config/database');

test.before(async () => {
  await connectDB();
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) server.close();
});

test('GET /health returns status UP', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.status, 'UP');
});

test('End-to-End API Journey: Auth -> Resume -> JD -> Analysis -> Security Ownership', async () => {
  // 1. Google Authentication
  const authRes = await fetch(`${baseUrl}/api/v1/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: 'test_google_token_user_a@example.com' })
  });
  assert.equal(authRes.status, 200);
  const authData = await authRes.json();
  assert.equal(authData.success, true);
  const token = authData.data.accessToken;
  assert.ok(token);

  // 2. Fetch User Profile
  const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.equal(meRes.status, 200);
  const meData = await meRes.json();
  assert.equal(meData.success, true);
  assert.ok(meData.data.user.email);

  // 3. Create Job Description
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

  // 4. Create Resume (using text parser directly for test stream)
  const resumeFormData = new FormData();
  const blob = new Blob(['John Doe\nFlutter Developer\nSkills: Flutter, Dart, Firebase, REST API, MongoDB'], { type: 'text/plain' });
  resumeFormData.append('file', blob, 'resume.txt');

  const resumeRes = await fetch(`${baseUrl}/api/v1/resumes`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: resumeFormData
  });
  assert.equal(resumeRes.status, 201);
  const resumeData = await resumeRes.json();
  const resumeId = resumeData.data.resume.id;
  assert.ok(resumeId);

  // 5. Create Analysis
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

  // 6. Security Check: User B cannot access User A's Analysis
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
