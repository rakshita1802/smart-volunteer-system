const express = require('express');
const router = express.Router();
const { getMatches, autoAssign } = require('../controllers/matchController');

router.get('/:issueId', getMatches);
router.post('/assign', autoAssign);

module.exports = router;