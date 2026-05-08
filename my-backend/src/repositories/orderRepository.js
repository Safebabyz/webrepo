'use strict';

/**
 * orderRepository.js — Repository Layer
 * -------------------------------------------------------
 * ทำหน้าที่เดียว: เขียน/อ่าน orders ใน SQLite (store.db)
 * SQL ทั้งหมดอยู่ที่นี่เท่านั้น — ไม่มี db.run ใน Controller อีกต่อไป
 */

const db = require('../database');

/**
 * บันทึก order ใหม่
 * @param {{ userEmail: string, totalPrice: number }} param
 * @returns {Promise<{ id: number, userEmail: string, totalPrice: number }>}
 */
function createOrder({ userEmail, totalPrice }) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO orders (user_email, total_price) VALUES (?, ?)`;
    db.run(sql, [userEmail, totalPrice], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, userEmail, totalPrice });
    });
  });
}

/**
 * ดึง orders ทั้งหมดของ user
 * @param {string} userEmail
 * @returns {Promise<object[]>}
 */
function findByUserEmail(userEmail) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM orders WHERE user_email = ? ORDER BY order_date DESC`;
    db.all(sql, [userEmail], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { createOrder, findByUserEmail };
