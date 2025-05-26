const express = require('express');
const router = express.Router();
const { chatWithBot } = require('../controllers/chatController');

// POST /api/chat - Get bot response (no history, no chat saving)
router.post('/', async (req, res) => {
  console.log('[ROUTE] /api/chat POST hit:', req.body);

  try {
    const { companyName, question } = req.body;
    // Log extracted fields
    console.log('[ROUTE] companyName:', companyName, '| question:', question);

    if (!companyName || !question) {
      console.log('[ROUTE] Validation failed: Missing companyName or question');
      return res.status(400).json({ error: 'companyName and question are required.' });
    }

    // Get bot response
    const botRes = await chatWithBot(req, res, true);
    console.log('[ROUTE] Bot response:', botRes);

    if (!botRes?.answer) {
      return res.status(500).json({ error: 'Failed to generate bot response' });
    }

    res.json({ answer: botRes.answer });
  } catch (error) {
    console.error('[CHAT ROUTE ERROR]', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

module.exports = router;
