const express = require('express');
const router = express.Router();
const { getAllIssues, getIssueById, createIssue, updateIssue, deleteIssue } = require('../controllers/issueController');

router.get('/', getAllIssues);
router.get('/:id', getIssueById);
router.post('/', createIssue);
router.put('/:id', updateIssue);
router.delete('/:id', deleteIssue);

module.exports = router;