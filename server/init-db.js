const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// First connect to default postgres DB to create our new database
const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'postgres', // default db
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function init() {
  try {
    console.log('Connecting to postgres...');
    // Create database if it doesn't exist
    const res = await pgPool.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = 'volunteer_mgmt'`);
    if (res.rowCount === 0) {
      console.log('Creating database volunteer_mgmt...');
      await pgPool.query('CREATE DATABASE volunteer_mgmt');
    } else {
      console.log('Database volunteer_mgmt already exists.');
    }
    await pgPool.end();

    // Now connect to the newly created db
    console.log('Connecting to volunteer_mgmt...');
    const appPool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: 'volunteer_mgmt',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('Running schema.sql...');
    // We need to strip out the CREATE DATABASE and \c commands from schema.sql
    let schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    schema = schema.replace(/CREATE DATABASE volunteer_mgmt;/gi, '');
    schema = schema.replace(/\\c volunteer_mgmt;/gi, '');
    
    await appPool.query(schema);

    console.log('Running seed.sql...');
    try {
      const seed = fs.readFileSync(path.join(__dirname, 'db', 'seed.sql'), 'utf8');
      await appPool.query(seed);
    } catch(err) {
      console.log('No seed file or error seeding (possibly already seeded).');
    }

    console.log('Database initialized successfully!');
    await appPool.end();
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

init();
