const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const issues = [
  { title: "Critical Water Main Break", desc: "A massive pipe burst leaving 3 blocks without drinking water. Immediate bottled water distribution required.", loc: "Houston", type: "water", sev: 5, ppl: 1200 },
  { title: "Post-Storm Shelter Needs", desc: "Recent storms have damaged roofs for several elderly residents. Temporary shelter and tarping needed.", loc: "New York", type: "shelter", sev: 4, ppl: 45 },
  { title: "Community Food Drive", desc: "Local pantry is completely depleted following the holidays. Need logistics support and food sorting.", loc: "Chicago", type: "food", sev: 3, ppl: 500 },
  { title: "After-School STEM Tutors", desc: "Title 1 school requires volunteer tutors for their new after-school robotics and math program.", loc: "San Francisco", type: "education", sev: 2, ppl: 60 },
  { title: "Free Health Clinic Setup", desc: "Setting up a pop-up health clinic for uninsured families. Need medical professionals and admin staff.", loc: "Los Angeles", type: "health", sev: 5, ppl: 350 },
  { title: "Heatwave Cooling Center", desc: "Extreme temperatures expected. Need volunteers to man the cooling center and distribute ice.", loc: "Phoenix", type: "health", sev: 5, ppl: 800 },
  { title: "Flooded Library Recovery", desc: "Basement of the public library flooded. Need help salvaging books and cleaning debris.", loc: "Seattle", type: "education", sev: 3, ppl: 200 },
  { title: "Homeless Winter Supply Kits", desc: "Distributing sleeping bags and warm clothing to unhoused individuals before the freeze.", loc: "Chicago", type: "shelter", sev: 4, ppl: 150 },
  { title: "Boil Water Advisory", desc: "Contamination detected in local reservoir. Need field workers to distribute purification tablets.", loc: "Austin", type: "water", sev: 5, ppl: 2500 },
  { title: "Community Garden Harvest", desc: "Harvesting fresh produce to donate to the local soup kitchen before the frost hits.", loc: "Seattle", type: "food", sev: 2, ppl: 100 }
];

const volunteers = [
  { name: "Dr. Sarah Chen", email: "sarah.chen@med.org", loc: "Los Angeles", skills: "['medical', 'first_aid', 'nursing']", avail: "weekends" },
  { name: "Marcus Johnson", email: "marcus.j@build.org", loc: "New York", skills: "['construction', 'engineering']", avail: "anytime" },
  { name: "Elena Rodriguez", email: "elena.r@teach.edu", loc: "San Francisco", skills: "['teaching', 'tutoring']", avail: "weekdays" },
  { name: "James Wilson", email: "jwilson@logistics.net", loc: "Chicago", skills: "['logistics', 'field_work']", avail: "anytime" },
  { name: "Aisha Patel", email: "apatel@water.org", loc: "Houston", skills: "['engineering', 'plumbing', 'field_work']", avail: "weekends" },
  { name: "David Kim", email: "dkim@foodbank.org", loc: "Seattle", skills: "['logistics', 'cooking']", avail: "weekdays" },
  { name: "Maria Garcia", email: "mgarcia@health.org", loc: "Phoenix", skills: "['nursing', 'first_aid']", avail: "anytime" },
  { name: "Tom Baker", email: "tbaker@rescue.org", loc: "Austin", skills: "['field_work', 'plumbing']", avail: "weekends" }
];

async function seed() {
  try {
    console.log('Clearing old data...');
    await pool.query('TRUNCATE tasks, issues, volunteers RESTART IDENTITY CASCADE');

    console.log('Inserting realistic issues...');
    for (const i of issues) {
      await pool.query(
        `INSERT INTO issues (title, description, location, problem_type, severity, people_affected) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [i.title, i.desc, i.loc, i.type, i.sev, i.ppl]
      );
    }

    console.log('Inserting realistic volunteers...');
    for (const v of volunteers) {
      await pool.query(
        `INSERT INTO volunteers (name, email, phone, location, skills, availability) 
         VALUES ($1, $2, '555-0101', $3, ARRAY${v.skills}, $4)`,
        [v.name, v.email, v.loc, v.avail]
      );
    }

    console.log('Database seeded with highly realistic data successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();
