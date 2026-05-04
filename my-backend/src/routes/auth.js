const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// POST /api/login
router.post('/login', authController.login);

module.exports = router;