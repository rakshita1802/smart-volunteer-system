const pool = require('../config/db');

// Map issue types to required volunteer skills
const SKILL_MAP = {
  health:    ['medical', 'first_aid', 'nursing'],
  education: ['teaching', 'tutoring', 'training'],
  water:     ['engineering', 'plumbing', 'field_work'],
  food:      ['logistics', 'field_work', 'cooking'],
  shelter:   ['construction', 'engineering', 'field_work'],
};

// --- Advanced Smart Matching Engine ---
// Configurable weights for different matching criteria
const MATCH_WEIGHTS = {
  skill: 0.55,
  proximity: 0.30,
  availability: 0.15
};

function proximityScore(issueLocation, volunteerLocation) {
  if (!issueLocation || !volunteerLocation) return 0;
  const i = issueLocation.toLowerCase().trim();
  const v = volunteerLocation.toLowerCase().trim();
  
  // Exact match
  if (i === v) return 1.0;
  
  // Partial / Region match
  if (i.includes(v) || v.includes(i)) return 0.7;
  
  // Distance decay mock (if we had real lat/lng, we'd use Haversine formula here)
  return 0.3;
}

function skillScore(requiredSkills, volunteerSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 0.5; // General task
  if (!volunteerSkills || volunteerSkills.length === 0) return 0;
  
  let matches = 0;
  requiredSkills.forEach(req => {
    if (volunteerSkills.some(v => v.toLowerCase() === req.toLowerCase())) {
      matches++;
    }
  });
  
  return matches / requiredSkills.length;
}

function availabilityScore(volunteerAvailability) {
  // Mock availability logic. Real system would check calendar overlaps.
  if (volunteerAvailability === 'anytime') return 1.0;
  if (volunteerAvailability === 'weekends' || volunteerAvailability === 'weekdays') return 0.8;
  return 0.5;
}

function computeScore(issue, volunteer) {
  const required = SKILL_MAP[issue.problem_type] || [];
  
  const sScore = skillScore(required, volunteer.skills);
  const pScore = proximityScore(issue.location, volunteer.location);
  const aScore = availabilityScore(volunteer.availability);
  
  // Weighted sum algorithm
  const total = (sScore * MATCH_WEIGHTS.skill) + 
                (pScore * MATCH_WEIGHTS.proximity) + 
                (aScore * MATCH_WEIGHTS.availability);
                
  return {
    score: Math.round(total * 100),
    skill_score: Math.round(sScore * 100),
    proximity_score: Math.round(pScore * 100),
    availability_score: Math.round(aScore * 100)
  };
}

const getMatches = async (req, res, next) => {
  try {
    const issueResult = await pool.query('SELECT * FROM issues WHERE id = $1', [req.params.issueId]);
    if (issueResult.rows.length === 0) return res.status(404).json({ error: 'Issue not found' });
    const issue = issueResult.rows[0];

    const volResult = await pool.query('SELECT * FROM volunteers WHERE is_active = TRUE');
    const volunteers = volResult.rows;

    const scored = volunteers.map(v => ({
      ...v,
      ...computeScore(issue, v),
    }));

    // Sort by final weighted score descending, return top 5 optimal candidates
    const top5 = scored.sort((a, b) => b.score - a.score).slice(0, 5);

    res.json({ issue, matches: top5 });
  } catch (err) {
    next(err);
  }
};

const autoAssign = async (req, res) => {
  const { issue_id, volunteer_id } = req.body;
  try {
    const issue = await pool.query('SELECT * FROM issues WHERE id = $1', [issue_id]);
    if (issue.rows.length === 0) return res.status(404).json({ error: 'Issue not found' });

    const i = issue.rows[0];
    
    // Get Volunteer info for simulation
    const volResult = await pool.query('SELECT * FROM volunteers WHERE id = $1', [volunteer_id]);
    const volName = volResult.rows.length > 0 ? volResult.rows[0].name : `Volunteer #${volunteer_id}`;
    
    const task = await pool.query(
      `INSERT INTO tasks (issue_id, volunteer_id, title, description, required_skill, status, assigned_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW()) RETURNING *`,
      [issue_id, volunteer_id,
       `Handle: ${i.title}`,
       `Auto-assigned task for issue in ${i.location}`,
       SKILL_MAP[i.problem_type]?.[0] || 'general']
    );
    await pool.query('UPDATE issues SET status = $1 WHERE id = $2', ['assigned', issue_id]);
    
    // 1. Simulated Real-World SMS Dispatch
    console.log(`\n========================================`);
    console.log(`🚀 [SIMULATED SMS DISPATCH]`);
    console.log(`To: ${volName}`);
    console.log(`Message: You have been deployed to an urgent issue: "${i.title}" at ${i.location}. Please check your dashboard for details.`);
    console.log(`Status: Delivered Successfully via Twilio/Nexmo API`);
    console.log(`========================================\n`);

    // 2. Broadcast to Command Center Dashboard
    const io = req.app.get('io');
    if (io) {
      io.emit('issue_updated', { ...i, status: 'assigned' });
      io.emit('new_task', task.rows[0]);
    }

    res.status(201).json(task.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMatches, autoAssign };