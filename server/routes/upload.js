const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const pool = require('../config/db');

const upload = multer({ dest: 'uploads/' });

router.post('/csv', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        let count = 0;
        for (const row of results) {
          // simple validation or defaults
          const title = row.title || 'Bulk Upload Issue';
          const description = row.description || 'Uploaded via CSV';
          const location = row.location || 'Unknown';
          const problem_type = row.problem_type || 'other';
          const severity = parseInt(row.severity) || 3;
          const people_affected = parseInt(row.people_affected) || 0;

          await pool.query(
            `INSERT INTO issues (title, description, location, problem_type, severity, people_affected)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [title, description, location, problem_type, severity, people_affected]
          );
          count++;
        }
        
        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);
        
        res.status(200).json({ message: `Successfully uploaded ${count} issues.` });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error during bulk insert' });
      }
    });
});

module.exports = router;
