const Knowledge = require('../models/Knowledge');

const getAllKnowledge = async (req, res) => {
  try {
    const { type, category } = req.query;
    const where = {};
    if (type) where.type = type;
    if (category) where.category = category;

    const items = await Knowledge.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(items);
  } catch (error) {
    console.error('Fetch knowledge error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge base items' });
  }
};

const getKnowledgeById = async (req, res) => {
  try {
    const item = await Knowledge.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Knowledge item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch knowledge item' });
  }
};

module.exports = {
  getAllKnowledge,
  getKnowledgeById
};
