const fs = require('fs').promises;
const path = require('path');

// ชื่อไฟล์ JSON ที่เก็บข้อมูลสินค้า (ปรับตามโครงสร้างโปรเจกต์ของคุณ)
const DATA_FILE = path.join(__dirname, '../../data/products.json');

/**
 * โหลดไฟล์ products.json และแปลงเป็น Array
 */
async function loadProducts() {
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

/**
 * คืนรายการสินค้าทั้งหมด
 */
async function getAllProducts() {
  return await loadProducts();
}

/**
 * คืนรายการสินค้าตามหมวดหมู่ (case-insensitive)
 * @param {string} category
 */
async function getProductsByCategory(category) {
  const all = await loadProducts();
  if (!category) return all;
  const cat = String(category).toLowerCase();
  return all.filter(p => String(p.category || '').toLowerCase() === cat);
}

module.exports = { getAllProducts, getProductsByCategory };