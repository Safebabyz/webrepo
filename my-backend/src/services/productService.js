'use strict';

/**
 * productService.js — Service Layer
 * -------------------------------------------------------
 * Business logic เกี่ยวกับ Product ล้วนๆ
 * ข้อมูลมาจาก productRepository เท่านั้น
 *
 * [MICROSERVICE NOTE]
 * เมื่อแตกเป็น Catalog Service:
 *   - ฟังก์ชันเหล่านี้ยังคงอยู่ใน Catalog Service เหมือนเดิม
 *   - Order Service จะเรียกผ่าน HTTP แทน: fetch('http://catalog-service:3002/api/products/:id')
 */

const productRepository = require('../repositories/productRepository');

/** คืนสินค้าทั้งหมด */
async function getAllProducts() {
  return productRepository.findAll();
}

/**
 * คืนสินค้าตามหมวดหมู่
 * @param {string} category
 */
async function getProductsByCategory(category) {
  return productRepository.findByCategory(category);
}

/**
 * ดึงราคาสินค้าจาก id (ใช้ใน Order Service เพื่อ verify ราคา)
 * — ไม่เชื่อราคาจาก frontend เด็ดขาด
 * @param {string|number} id
 * @returns {Promise<number>} price
 */
async function getProductPrice(id) {
  const product = await productRepository.findById(id);
  if (!product) {
    const err = new Error(`ไม่พบสินค้า id: ${id}`);
    err.statusCode = 404;
    throw err;
  }
  return product.price;
}

module.exports = { getAllProducts, getProductsByCategory, getProductPrice };
