const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'root',
  host: 'localhost',
  port: 5432,
  database: 'stayzone',
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');
    const res = await client.query('TRUNCATE TABLE users CASCADE;');
    console.log('Truncated users table and all related entities successfully.');
  } catch (err) {
    console.error('Error truncating table:', err);
  } finally {
    await client.end();
  }
}

run();
