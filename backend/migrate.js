const pool = require('./database');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
pool.query(readFileSync(join(__dirname, 'database/auth.sql'), 'utf8'))
  .then(() => console.log('Account and session tables are ready.'))
  .catch(error => { console.error(error.message); process.exitCode = 1; })
  .finally(() => pool.end());
