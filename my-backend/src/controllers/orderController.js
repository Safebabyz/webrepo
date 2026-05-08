'use strict';

/**
 * orderController.js — Controller Layer (NEW)
 * -------------------------------------------------------
 * ทำหน้าที่เดียว: รับ HTTP → เรียก orderService → ส่ง HTTP response
 * ไม่มี SQL, ไม่มี business logic ที่นี่
 *
 * BEFORE (auth controller เดิม):
 *   const total = cart.reduce(...) + 10;         ← business logic ใน controller ❌
 *   db.run(`INSERT INTO orders ...`, [email, total]) ← SQL ใน controller ❌
 *
 * AFTER:
 *   const result = await orderService.placeOrder({ cart, email, creditCard }); ✅
 */

const orderService = require('../services/orderService');

// ---------------------------------------------------------------------------
// POST /api/checkout
// ---------------------------------------------------------------------------
async function checkout(req, res) {
  try {
    const { cart, email, creditCard } = req.body || {};

    const result = await orderService.placeOrder({ cart, email, creditCard });

    return res.status(200).json({
      status:  'Success',
      message: 'บันทึกคำสั่งซื้อเรียบร้อย!',
      orderId: result.orderId,
      total:   result.total,
    });

  } catch (err) {
    const statusCode = err.statusCode || 500;
    console.error('checkout error:', err);
    return res.status(statusCode).json({ status: 'Fail', message: err.message });
  }
}

module.exports = { checkout };
