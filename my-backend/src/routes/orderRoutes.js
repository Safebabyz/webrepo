'use strict';

const express          = require('express');
const router           = express.Router();
const orderController  = require('../controllers/orderController');

// POST /api/checkout
router.post('/checkout', orderController.checkout);

module.exports = router;
