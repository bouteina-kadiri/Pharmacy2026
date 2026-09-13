const { Router } = require('express');
const { randomBytes, scrypt, timingSafeEqual, createHash } = require('node:crypto');
const { promisify } = require('node:util');
const derive = promisify(scrypt);
const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/api/users' };
const digest = value => createHash('sha256').update(value).digest('hex');
const sessionToken = req => (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('pharmacy_session='))?.slice(17);
const publicUser = user => ({ id: user.id, name: user.name, lastName: user.last_name, email: user.email });

function createAuthRouter(pool) {
  const router = Router();
  const attempts = new Map();
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (req.method !== 'POST' || req.path === '/logout') return next();
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
    const entry = attempts.get(req.ip) || { count: 0, until: now + 15 * 60 * 1000 };
    attempts.set(req.ip, entry);
    if (++entry.count > 30) return res.status(429).json({ message: 'Too many attempts. Please try again in 15 minutes.' });
    next();
  });

  router.post('/signup', async (req, res, next) => {
    const { name, lastName, email, password } = req.body || {};
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 150 ||
        typeof lastName !== 'string' || !lastName.trim() || lastName.trim().length > 150 ||
        typeof email !== 'string' || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        typeof password !== 'string' || password.length < 12 || password.length > 128) {
      return res.status(400).json({ message: 'Enter your first name, last name, valid email, and a password of 12–128 characters.' });
    }
    try {
      const salt = randomBytes(16).toString('hex');
      const hash = await derive(password, salt, 64, { N: 32768, maxmem: 64 * 1024 * 1024 });
      await pool.query(
        'INSERT INTO client_accounts (name, last_name, email, password_hash) VALUES ($1, $2, $3, $4)',
        [name.trim(), lastName.trim(), email.trim().toLowerCase(), `scrypt:${salt}:${hash.toString('hex')}`]
      );
      res.status(201).json({ success: true, message: 'Account created. Please sign in.' });
    } catch (error) {
      if (error.code === '23505') return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
      next(error);
    }
  });

  router.post('/login', async (req, res, next) => {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || email.length > 254 || typeof password !== 'string' || !password || password.length > 128) {
      return res.status(400).json({ message: 'Enter a valid email and password.' });
    }
    try {
      const result = await pool.query('SELECT * FROM client_accounts WHERE email = $1', [email.trim().toLowerCase()]);
      const user = result.rows[0];
      // Derive a hash even for an unknown email to avoid a fast account-existence check.
      const [, salt, stored] = user ? user.password_hash.split(':') : ['scrypt', '0'.repeat(32), '0'.repeat(128)];
      const hash = await derive(password, salt, 64, { N: 32768, maxmem: 64 * 1024 * 1024 });
      if (!timingSafeEqual(hash, Buffer.from(stored, 'hex')) || !user) {
        return res.status(401).json({ message: 'The email or password is incorrect. New clients must sign up first.' });
      }
      const previous = sessionToken(req);
      if (previous) await pool.query('DELETE FROM client_sessions WHERE token_hash = $1', [digest(previous)]);
      await pool.query('DELETE FROM client_sessions WHERE expires_at <= NOW()');
      const token = randomBytes(32).toString('hex');
      await pool.query("INSERT INTO client_sessions (token_hash, account_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '8 hours')", [digest(token), user.id]);
      res.cookie('pharmacy_session', token, { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 });
      res.json({ success: true, user: publicUser(user) });
    } catch (error) { next(error); }
  });

  router.get('/me', async (req, res, next) => {
    const token = sessionToken(req);
    if (!token) return res.status(401).json({ message: 'Please sign in.' });
    try {
      const result = await pool.query(`SELECT a.* FROM client_accounts a JOIN client_sessions s ON s.account_id = a.id
        WHERE s.token_hash = $1 AND s.expires_at > NOW()`, [digest(token)]);
      if (!result.rowCount) return res.status(401).json({ message: 'Please sign in again.' });
      res.json({ user: publicUser(result.rows[0]) });
    } catch (error) { next(error); }
  });

  router.post('/logout', async (req, res, next) => {
    try {
      const token = sessionToken(req);
      if (token) await pool.query('DELETE FROM client_sessions WHERE token_hash = $1', [digest(token)]);
      res.clearCookie('pharmacy_session', cookieOptions);
      res.json({ success: true });
    } catch (error) { next(error); }
  });
  return router;
}
module.exports = { createAuthRouter };
