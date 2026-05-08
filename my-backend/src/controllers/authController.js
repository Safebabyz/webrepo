'use strict';

/**
 * authController.js — Controller Layer (REFACTORED)
 * -------------------------------------------------------
 * ทำหน้าที่เดียว: รับ HTTP request → เรียก service → ส่ง HTTP response
 * ไม่มี business logic, ไม่มี SQL, ไม่มี file I/O ที่นี่
 *
 * BEFORE: checkout() มี db.run(INSERT INTO orders...) ตรงใน controller ❌
 * AFTER:  checkout ย้ายไป orderController + orderService แล้ว ✅
 */

const bcrypt       = require('bcrypt');
const crypto       = require('crypto');
const userService  = require('../services/userService');

// ---------------------------------------------------------------------------
// Helper: constant-time hex string comparison (anti-timing-attack)
// ---------------------------------------------------------------------------
function safeHexCompare(a, b) {
  try {
    const bufA = Buffer.from(String(a), 'utf8');
    const bufB = Buffer.from(String(b), 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// Helper: ทำ bcrypt ปลอมเพื่อป้องกัน user-enumeration timing attack
async function fakeVerifyDelay() {
  const fakeHash = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 10);
  try { await bcrypt.compare('fake-password', fakeHash); } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// POST /api/login
// ---------------------------------------------------------------------------
async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ status: 'Fail', message: 'Email and password are required.' });
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(String(email))) {
      return res.status(400).json({ status: 'Fail', message: 'Invalid email format.' });
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      await fakeVerifyDelay();
      return res.status(401).json({ status: 'Fail', message: 'Invalid email or password.' });
    }

    const stored = String(user.password || '');
    let passwordMatches = false;

    if (stored.startsWith('$2')) {
      passwordMatches = await bcrypt.compare(password, stored);
    } else if (/^[a-f0-9]{32}$/i.test(stored)) {
      const md5 = crypto.createHash('md5').update(password).digest('hex');
      passwordMatches = safeHexCompare(md5, stored);
    } else {
      passwordMatches = safeHexCompare(password, stored);
    }

    if (!passwordMatches) {
      return res.status(401).json({ status: 'Fail', message: 'Invalid email or password.' });
    }

    const { password: _pw, ...safeUser } = user;
    return res.status(200).json({ status: 'Success', data: safeUser });

  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ status: 'Fail', message: 'Internal server error.' });
  }
}

// ---------------------------------------------------------------------------
// POST /api/register
// ---------------------------------------------------------------------------
async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'Fail', message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status:  'Fail',
        message: 'รหัสผ่านต้องยาว 8 ตัวขึ้นไป, มีตัวพิมพ์ใหญ่ และอักขระพิเศษอย่างน้อย 1 ตัว',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // userService.createUser ตรวจสอบ email ซ้ำภายในตัวเอง
    const newUser = await userService.createUser({ name, email, password: hashedPassword });

    return res.status(201).json({
      status:  'Success',
      message: 'ลงทะเบียนสำเร็จ',
      data:    newUser,
    });

  } catch (err) {
    const statusCode = err.statusCode || 500;
    console.error('register error:', err);
    return res.status(statusCode).json({ status: 'Fail', message: err.message });
  }
}

module.exports = { login, register };
