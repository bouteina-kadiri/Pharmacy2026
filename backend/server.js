const express = require('express');
const cors = require('cors');
const pool = require('./database');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// API status
app.get('/api', (req, res) => {
  res.json({ message: 'API is running!' });
});

// PostgreSQL connection status
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ message: 'API and database are running!' });
  } catch (error) {
    res.status(503).json({ message: 'Database is unavailable.', error: error.message });
  }
});

// Clients stored in PostgreSQL
app.get('/api/clients', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT clients.*, pharmacies.name AS pharmacy_name
      FROM clients
      JOIN pharmacies ON pharmacies.id = clients.pharmacy_id
      ORDER BY clients.id
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/clients', async (req, res, next) => {
  const { pharmacyId, name, lastName, dateOfBirth, prescription, dosage, address, phoneNumber } = req.body;

  if (!pharmacyId || !name || !lastName || !dateOfBirth) {
    return res.status(400).json({ message: 'pharmacyId, name, lastName, and dateOfBirth are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO clients
        (pharmacy_id, name, last_name, date_of_birth, prescription, dosage, address, phone_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [pharmacyId, name, lastName, dateOfBirth, prescription || null, dosage || null, address || null, phoneNumber || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get users
app.get('/api/users/all', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    }
  ]);
});

// Login
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;

  // Temporary test login
  if (email === 'test@example.com' && password === '123456') {
    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }
    });
  }

  res.status(401).json({
    success: false,
    message: 'Invalid email or password'
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
