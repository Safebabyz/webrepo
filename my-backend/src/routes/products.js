const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products');

// ใช้แค่ '/' เพราะเราเชื่อม /api/products มาจาก app.js แล้ว
router.get('/', productsController.getProducts); 

module.exports = router;