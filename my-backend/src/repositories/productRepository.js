'use strict';

/**
 * productRepository.js — Repository Layer
 * -------------------------------------------------------
 * ทำหน้าที่เดียว: อ่านข้อมูลจาก products.json
 * ในอนาคตเปลี่ยนเป็น DB ได้โดยไม่กระทบ Service
 */

const fs   = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../../data/products.json');

/** โหลด products array ทั้งหมด */
async function findAll() {
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  const data = JSON.parse(raw);
  // กรองออกเฉพาะ object ที่มี id และ price (สินค้าจริง)
  return data.filter((item) => item.id !== undefined && item.price !== undefined);
}

/**
 * หาสินค้าด้วย id
 * @param {string|number} id
 * @returns {object|null}
 */
async function findById(id) {
  const all = await findAll();
  return all.find((p) => String(p.id) === String(id)) || null;
}

/**
 * หาสินค้าตามหมวดหมู่ (case-insensitive)
 * @param {string} category
 * @returns {object[]}
 */
async function findByCategory(category) {
  const all = await findAll();
  if (!category) return all;
  const cat = String(category).toLowerCase();
  return all.filter(
    (p) => String(p.category || '').toLowerCase() === cat
  );
}

module.exports = { findAll, findById, findByCategory };
