const pool = require('../config/db');

const getAllIssues = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM issues');
    
    // Priority Detection Algorithm
    // Score = (Severity * 20) + (People Affected / 10) + (Hours Since Request * 0.5)
    const scoredIssues = result.rows.map(issue => {
      const hoursSince = (new Date() - new Date(issue.reported_at)) / (1000 * 60 * 60);
      let urgencyScore = (issue.severity * 20) + (Math.min(issue.people_affected || 0, 1000) / 10) + (hoursSince * 0.5);
      urgencyScore = Math.round(Math.min(urgencyScore, 100)); // Cap at 100
      
      return { ...issue, urgency_score: urgencyScore };
    });
    
    // Sort by calculated urgency score
    scoredIssues.sort((a, b) => b.urgency_score - a.urgency_score);
    
    res.json(scoredIssues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getIssueById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM issues WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Issue not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createIssue = async (req, res) => {
  const { title, description, location, problem_type, severity, people_affected } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO issues (title, description, location, problem_type, severity, people_affected)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, location, problem_type, severity, people_affected]
    );
    const newIssue = result.rows[0];
    
    // Broadcast to Command Center (Dashboard & Map)
    const io = req.app.get('io');
    if (io) io.emit('new_issue', newIssue);
    
    res.status(201).json(newIssue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateIssue = async (req, res) => {
  const { title, description, location, problem_type, severity, people_affected, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE issues SET title=$1, description=$2, location=$3, problem_type=$4,
       severity=$5, people_affected=$6, status=$7 WHERE id=$8 RETURNING *`,
      [title, description, location, problem_type, severity, people_affected, status, req.params.id]
    );
    const updated = result.rows[0];
    const io = req.app.get('io');
    if (io) io.emit('issue_updated', updated);
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteIssue = async (req, res) => {
  try {
    await pool.query('DELETE FROM issues WHERE id = $1', [req.params.id]);
    const io = req.app.get('io');
    if (io) io.emit('issue_deleted', req.params.id);
    res.json({ message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllIssues, getIssueById, createIssue, updateIssue, deleteIssue };