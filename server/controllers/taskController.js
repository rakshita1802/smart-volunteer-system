const pool = require('../config/db');

const getAllTasks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, i.title as issue_title, i.location as issue_location,
             v.name as volunteer_name, v.email as volunteer_email
      FROM tasks t
      LEFT JOIN issues i ON t.issue_id = i.id
      LEFT JOIN volunteers v ON t.volunteer_id = v.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, i.title as issue_title, v.name as volunteer_name
      FROM tasks t
      LEFT JOIN issues i ON t.issue_id = i.id
      LEFT JOIN volunteers v ON t.volunteer_id = v.id
      WHERE t.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createTask = async (req, res) => {
  const { issue_id, volunteer_id, title, description, required_skill } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tasks (issue_id, volunteer_id, title, description, required_skill, assigned_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [issue_id, volunteer_id, title, description, required_skill]
    );
    // Update issue status to assigned
    await pool.query('UPDATE issues SET status = $1 WHERE id = $2', ['assigned', issue_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const completed_at = status === 'completed' ? 'NOW()' : 'NULL';
    const result = await pool.query(
      `UPDATE tasks SET status=$1, completed_at=${completed_at} WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    // If completed, update issue too
    if (status === 'completed') {
      await pool.query('UPDATE issues SET status=$1 WHERE id=$2',
        ['resolved', result.rows[0].issue_id]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTaskStatus, deleteTask };