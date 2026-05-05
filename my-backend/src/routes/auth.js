const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// 1. เส้นทางสำหรับ Login (มีอยู่แล้ว)
router.post('/login', authController.login);

// 2. ส่วนที่ต้องเพิ่ม: เส้นทางสำหรับ Register
// เมื่อมีการเรียก POST มาที่ /api/register จะไปเรียกฟังก์ชัน register ใน Controller
// กำหนดเส้นทางสำหรับสมัครสมาชิก (POST)
router.post('/register', authController.register); 

module.exports = router;