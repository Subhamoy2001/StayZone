const { Client } = require('pg');
const client = new Client({ user: 'postgres', password: 'root', host: 'localhost', port: 5432, database: 'stayzone' });
async function run() {
  await client.connect();
  const res = await client.query('SELECT * FROM users');
  console.log(res.rows);
  await client.end();
}
run();
