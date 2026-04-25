const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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
    
    // We only want the TABLE creates, not the DATABASE creates
    const fullSchemaSql = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf8');
    
    // Extract the part starting with CREATE TABLE
    const schemaSql = fullSchemaSql.substring(fullSchemaSql.indexOf('CREATE TABLE issues'));

    const seedSql = fs.readFileSync(path.join(__dirname, 'db/seed.sql'), 'utf8');
    
    console.log('Running Schema...');
    await pool.query('DROP TABLE IF EXISTS tasks CASCADE;');
    await pool.query('DROP TABLE IF EXISTS volunteers CASCADE;');
    await pool.query('DROP TABLE IF EXISTS issues CASCADE;');
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
