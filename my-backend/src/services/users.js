const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/users.json');

/**
 * Load users.json and return parsed array
 */
async function loadUsers() {
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

/**
 * Find a user record by email (username field)
 * returns user object or null
 */
async function getUserByEmail(email) {
  if (!email) return null;
  const users = await loadUsers();
  return users.find(u => String(u.username).toLowerCase() === String(email).toLowerCase()) || null;
}

module.exports = { getUserByEmail };