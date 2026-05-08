'use strict';

/**
 * userService.js — Service Layer
 * -------------------------------------------------------
 * Business logic เกี่ยวกับ User ล้วนๆ
 * ไม่รู้ว่าข้อมูลมาจาก file หรือ DB (ให้ repository จัดการ)
 */

const userRepository = require('../repositories/userRepository');

/**
 * ค้นหา user ด้วย email
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function getUserByEmail(email) {
  return userRepository.findByEmail(email);
}

/**
 * สร้าง user ใหม่
 * — ตรวจสอบ email ซ้ำก่อน (guard inside service)
 * — รับ password ที่ hash แล้วเท่านั้น (hashing เป็นหน้าที่ controller/auth layer)
 *
 * @param {{ name: string, email: string, password: string }} param
 * @returns {Promise<object>} user ที่ไม่มี password field
 */
async function createUser({ name, email, password }) {
  // Double-check ภายใน service (defense-in-depth)
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('อีเมลนี้ถูกใช้งานแล้ว');
    err.statusCode = 409;
    throw err;
  }

  const newUser = {
    username:       email,
    firstName:      name,
    password:       password,         // bcrypt hash จาก controller
    registeredAt:   new Date().toISOString(),
  };

  const saved = await userRepository.save(newUser);

  // คืน user โดยไม่มี password field
  const { password: _pw, ...safeUser } = saved;
  return safeUser;
}

module.exports = { getUserByEmail, createUser };
