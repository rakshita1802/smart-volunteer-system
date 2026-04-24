const pool = require('../config/db');

const getAllVolunteers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM volunteers WHERE is_active = TRUE ORDER BY registered_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getVolunteerById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM volunteers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Volunteer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createVolunteer = async (req, res) => {
  const { name, email, phone, location, skills, availability } = req.body;
  const skillsArray = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
  try {
    const result = await pool.query(
      `INSERT INTO volunteers (name, email, phone, location, skills, availability)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, email, phone, location, skillsArray, availability]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateVolunteer = async (req, res) => {
  const { name, email, phone, location, skills, availability, is_active } = req.body;
  const skillsArray = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
  try {
    const result = await pool.query(
      `UPDATE volunteers SET name=$1, email=$2, phone=$3, location=$4,
       skills=$5, availability=$6, is_active=$7 WHERE id=$8 RETURNING *`,
      [name, email, phone, location, skillsArray, availability, is_active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteVolunteer = async (req, res) => {
  try {
    await pool.query('UPDATE volunteers SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Volunteer deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllVolunteers, getVolunteerById, createVolunteer, updateVolunteer, deleteVolunteer };