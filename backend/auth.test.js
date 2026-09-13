const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { randomUUID } = require('node:crypto');
const pool = require('./database');
const { createAuthRouter } = require('./auth');

test('PostgreSQL registration, password verification and session lifecycle', async () => {
  const client = await pool.connect();
  let server;
  try {
    await client.query('BEGIN');
    // Keep failed duplicate inserts from aborting the surrounding test transaction.
    const db = { query: async (...args) => {
      await client.query('SAVEPOINT request_query');
      try { return await client.query(...args); }
      catch (error) { await client.query('ROLLBACK TO SAVEPOINT request_query'); throw error; }
      finally { await client.query('RELEASE SAVEPOINT request_query'); }
    } };
    const app = express();
    app.use(express.json());
    app.use('/api/users', createAuthRouter(db));
    server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
    const base = `http://127.0.0.1:${server.address().port}/api/users`;
    const call = (path, body, cookie) => fetch(base + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const email = `auth-test-${randomUUID()}@example.com`;
    const account = { name: 'Test', lastName: 'Client', email, password: 'test password 12345' };
    assert.equal((await call('/login', account)).status, 401, 'sign-up is required');
    assert.equal((await call('/signup', { ...account, password: 'short' })).status, 400);
    assert.equal((await call('/signup', account)).status, 201);
    const stored = (await client.query('SELECT password_hash FROM client_accounts WHERE email = $1', [email])).rows[0];
    assert.match(stored.password_hash, /^scrypt:/);
    assert.ok(!stored.password_hash.includes(account.password));
    assert.equal((await call('/signup', { ...account, email: email.toUpperCase() })).status, 409);
    assert.equal((await call('/login', { email, password: 'incorrect password' })).status, 401);
    const response = await call('/login', { ...account, email: email.toUpperCase() });
    assert.equal(response.status, 200);
    const login = await response.json();
    assert.equal(login.user.email, email);
    assert.equal(login.user.password_hash, undefined);
    const setCookie = response.headers.get('set-cookie');
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Lax/i);
    const cookie = setCookie.split(';')[0];
    assert.equal((await call('/me')).status, 401);
    assert.equal((await call('/me', undefined, cookie)).status, 200, 'session persists');
    assert.equal((await call('/logout', {}, cookie)).status, 200);
    assert.equal((await call('/me', undefined, cookie)).status, 401, 'logout revokes session');
    const again = await call('/login', account);
    const expiredCookie = again.headers.get('set-cookie').split(';')[0];
    await client.query("UPDATE client_sessions SET expires_at = NOW() - INTERVAL '1 second' WHERE account_id = $1", [login.user.id]);
    assert.equal((await call('/me', undefined, expiredCookie)).status, 401);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
});
