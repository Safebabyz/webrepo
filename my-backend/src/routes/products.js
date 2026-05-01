const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');

// กำหนด Path หลัก
router.get('/', productController.getProducts);

module.exports = router;