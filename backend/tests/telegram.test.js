const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const http = require('http');
const { connectDB } = require('../src/config/database');
const mongoose = require('mongoose');

let server;
let baseUrl;

test.before(async () => {
  await connectDB();
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, async () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) server.close();
  await new Promise((r) => setTimeout(r, 200));
  try {
    await mongoose.disconnect();
  } catch (_) {}
});

test('Telegram Integration — GET /api/v1/telegram/info', async () => {
  const res = await fetch(`${baseUrl}/api/v1/telegram/info`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.status, 'ACTIVE');
});

test('Telegram Integration — POST /api/v1/telegram/webhook (/start command update)', async () => {
  const telegramUpdate = {
    update_id: 100001,
    message: {
      message_id: 1,
      from: { id: 987654321, is_bot: false, first_name: 'TelegramTestUser', username: 'testuser' },
      chat: { id: 987654321, type: 'private' },
      date: Math.floor(Date.now() / 1000),
      text: '/start'
    }
  };

  const res = await fetch(`${baseUrl}/api/v1/telegram/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(telegramUpdate)
  });

  assert.equal(res.status, 200);
});

test('Telegram Integration — POST /api/v1/telegram/webhook (JD text update)', async () => {
  const telegramUpdate = {
    update_id: 100002,
    message: {
      message_id: 2,
      from: { id: 987654321, is_bot: false, first_name: 'TelegramTestUser' },
      chat: { id: 987654321, type: 'private' },
      date: Math.floor(Date.now() / 1000),
      text: 'Senior Flutter Developer role. Required skills: Flutter, Dart, Firebase, REST API, Docker.'
    }
  };

  const res = await fetch(`${baseUrl}/api/v1/telegram/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(telegramUpdate)
  });

  assert.equal(res.status, 200);
});
