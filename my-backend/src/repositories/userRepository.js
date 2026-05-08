'use strict';

/**
 * userRepository.js — Repository Layer
 * -------------------------------------------------------
 * ทำหน้าที่เดียว: แตะไฟล์ users.json โดยตรง
 * Service Layer ไม่ควรรู้ว่าข้อมูลมาจาก file / DB / API
 */

const fs   = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../../data/users.json');

/** โหลด array ทั้งหมดจาก users.json */
async function loadUsers() {
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

/** บันทึก array กลับลง users.json */
async function saveUsers(users) {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
}

/**
 * ค้นหา user ด้วย email (username field)
 * @param {string} email
 * @returns {object|null}
 */
async function findByEmail(email) {
  if (!email) return null;
  const users = await loadUsers();
  return (
    users.find(
      (u) =>
        String(u.username).toLowerCase() === String(email).toLowerCase()
    ) || null
  );
}

/**
 * บันทึก user ใหม่เข้าไปใน users.json
 * @param {object} user — { username, firstName, password, registeredAt }
 * @returns {object} user ที่บันทึกแล้ว
 */
async function save(user) {
  const users = await loadUsers();
  users.push(user);
  await saveUsers(users);
  return user;
}

module.exports = { findByEmail, save };
