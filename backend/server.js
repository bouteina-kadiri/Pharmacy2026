const express = require('express');
const cors = require('cors');
const pool = require('./database');

const app = express();
const PORT = Number(process.env.PORT || 8080);

app.use(cors({ origin: ['http://localhost:4200', 'http://localhost:4201', 'http://127.0.0.1:4200', 'http://127.0.0.1:4201'], credentials: true }));
app.use(express.json());

// Do not expose pharmacy records on public hosting until record-level
// authorization links each client record to its authenticated account.
if (process.env.NODE_ENV === 'production') {
  app.use(['/api/clients', '/api/prescription-status'], (req, res) => {
    res.status(403).json({ message: 'This feature is unavailable on the public demo.' });
  });
}

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
    console.error('Database health check failed:', error.message);
    res.status(503).json({ message: 'Database is unavailable.' });
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

// Client-facing prescription pickup status
app.get('/api/prescription-status', async (req, res, next) => {
  const firstName = req.query.firstName?.trim();
  const lastName = req.query.lastName?.trim();

  if (!firstName || !lastName) {
    return res.status(400).json({ message: 'firstName and lastName are required.' });
  }

  try {
    const result = await pool.query(
      `SELECT name, last_name, prescription_ready
       FROM clients
       WHERE LOWER(name) = LOWER($1) AND LOWER(last_name) = LOWER($2)
       LIMIT 1`,
      [firstName, lastName]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No client was found with that name.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.post('/api/clients', async (req, res, next) => {
  const { pharmacyId, name, lastName, dateOfBirth, prescription, dosage, prescriptionReady, address, phoneNumber } = req.body;

  if (!pharmacyId || !name || !lastName || !dateOfBirth) {
    return res.status(400).json({ message: 'pharmacyId, name, lastName, and dateOfBirth are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO clients
        (pharmacy_id, name, last_name, date_of_birth, prescription, dosage, prescription_ready, address, phone_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [pharmacyId, name, lastName, dateOfBirth, prescription || null, dosage || null, prescriptionReady === true, address || null, phoneNumber || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.use('/api/users', require('./auth').createAuthRouter(pool));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error.' });
});

if (require.main === module) app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

module.exports = app;
