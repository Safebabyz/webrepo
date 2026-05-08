'use strict';

const express            = require('express');
const router             = express.Router();
const productController  = require('../controllers/productController');

// GET /api/products?category=...
router.get('/', productController.getProducts);

// GET /api/products/:id  (ใช้โดย Order Service เพื่อ verify ราคา)
router.get('/:id', productController.getProductById);

module.exports = router;
