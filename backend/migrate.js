const pool = require('./database');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(20260913)');
    for (const file of ['schema.sql', 'auth.sql']) {
      await client.query(readFileSync(join(__dirname, 'database', file), 'utf8'));
    }
    await client.query('COMMIT');
    console.log('Database tables are ready.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}
migrate().catch(error => { console.error(error.message); process.exitCode = 1; })
  .finally(() => pool.end());
