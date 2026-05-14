const express = require('express');
const router = express.Router();
const { getAllKnowledge, getKnowledgeById } = require('../controllers/knowledgeController');

router.get('/', getAllKnowledge);
router.get('/:id', getKnowledgeById);

module.exports = router;
