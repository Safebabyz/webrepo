const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products');

// Route: GET /api/products?category=Shirts
router.get('/', productsController.getProducts);

module.exports = router;