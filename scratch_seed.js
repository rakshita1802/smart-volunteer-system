const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runSeed() {
  try {
    console.log('Connecting to local database...');
    
    const schemaSql = fs.readFileSync(path.join(__dirname, '../server/db/schema.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, '../server/db/seed.sql'), 'utf8');
    
    console.log('Running Schema...');
    await pool.query(schemaSql);
    
    console.log('Running Seed Data...');
    await pool.query(seedSql);
    
    console.log('✅ Local Database successfully seeded!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
    process.exit(1);
  }
}

runSeed();
