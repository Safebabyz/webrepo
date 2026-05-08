'use strict';

/**
 * productController.js — Controller Layer (REFACTORED)
 * -------------------------------------------------------
 * ทำหน้าที่เดียว: รับ HTTP → เรียก productService → ส่ง HTTP response
 * (โครงสร้างดีอยู่แล้ว — เปลี่ยน import path เป็น productService)
 */

const productService = require('../services/productService');

// ---------------------------------------------------------------------------
// GET /api/products?category=...
// ---------------------------------------------------------------------------
async function getProducts(req, res) {
  try {
    const { category } = req.query;

    const result = category
      ? await productService.getProductsByCategory(category)
      : await productService.getAllProducts();

    return res.status(200).json({ status: 'Success', data: result });

  } catch (err) {
    console.error('getProducts error:', err);
    return res.status(500).json({ status: 'Fail', message: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/products/:id  (เพิ่มสำหรับ Order Service ที่จะ fetch ราคา)
// ---------------------------------------------------------------------------
async function getProductById(req, res) {
  try {
    const productRepository = require('../repositories/productRepository');
    const product = await productRepository.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ status: 'Fail', message: 'ไม่พบสินค้า' });
    }

    return res.status(200).json({ status: 'Success', data: product });

  } catch (err) {
    console.error('getProductById error:', err);
    return res.status(500).json({ status: 'Fail', message: err.message });
  }
}

module.exports = { getProducts, getProductById };
