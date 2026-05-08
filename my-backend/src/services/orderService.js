'use strict';

/**
 * orderService.js — Service Layer (NEW)
 * -------------------------------------------------------
 * Business logic ของ checkout ย้ายมาจาก authController ทั้งหมด
 *
 * [MICROSERVICE NOTE — Simulated Split]
 * ใน monolith: เรียก productService.getProductPrice() โดยตรง
 * เมื่อแตกเป็น Microservice จะเปลี่ยนเป็น:
 *
 *   async function fetchPriceFromCatalog(productId) {
 *     const res = await fetch(`http://catalog-service:3002/api/products/${productId}`);
 *     if (!res.ok) throw new Error(`Catalog service error: ${res.status}`);
 *     const { data } = await res.json();
 *     return data.price;
 *   }
 *
 * Order Service ไม่ต้องเข้าถึง products DB โดยตรงอีกต่อไป
 */

const orderRepository  = require('../repositories/orderRepository');
const productService   = require('./productService');  // ← replace with fetch() in true microservice

const SHIPPING_FEE = 10;

/**
 * ตรวจสอบข้อมูล checkout เบื้องต้น
 * @throws {Error} หากข้อมูลไม่ถูกต้อง
 */
function validateCheckout({ cart, email, creditCard }) {
  if (!email) {
    const err = new Error('กรุณาระบุ email');
    err.statusCode = 400;
    throw err;
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(String(email))) {
    const err = new Error('รูปแบบ email ไม่ถูกต้อง');
    err.statusCode = 400;
    throw err;
  }

  const cardStr = String(creditCard || '').replace(/\s/g, '');
  if (cardStr.length !== 16 || !/^\d{16}$/.test(cardStr)) {
    const err = new Error('หมายเลขบัตรเครดิตต้องเป็นตัวเลข 16 หลัก');
    err.statusCode = 400;
    throw err;
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    const err = new Error('ตะกร้าสินค้าว่างเปล่า');
    err.statusCode = 400;
    throw err;
  }
}

/**
 * คำนวณราคาสุทธิ โดย verify ราคาจาก Catalog (ไม่เชื่อ frontend)
 *
 * [MICROSERVICE NOTE]
 * productService.getProductPrice(id) จะถูกแทนที่ด้วย:
 *   fetch('http://catalog-service:3002/api/products/:id')
 *
 * @param {object[]} cart — [{ id, quantity }]
 * @returns {Promise<number>} total (รวม shipping)
 */
async function calculateTotal(cart) {
  let subtotal = 0;

  for (const item of cart) {
    if (!item.id || !item.quantity || item.quantity < 1) {
      const err = new Error(`ข้อมูลสินค้าไม่ถูกต้อง: ${JSON.stringify(item)}`);
      err.statusCode = 400;
      throw err;
    }

    // ดึงราคาจาก Catalog (ไม่เชื่อ item.price จาก frontend)
    const verifiedPrice = await productService.getProductPrice(item.id);
    subtotal += verifiedPrice * Number(item.quantity);
  }

  return subtotal + SHIPPING_FEE;
}

/**
 * สั่งซื้อสินค้า — entry point หลัก
 * @param {{ cart: object[], email: string, creditCard: string }} param
 * @returns {Promise<{ orderId: number, total: string }>}
 */
async function placeOrder({ cart, email, creditCard }) {
  // 1. Validate
  validateCheckout({ cart, email, creditCard });

  // 2. คำนวณราคาจาก Catalog (verified)
  const total = await calculateTotal(cart);

  // 3. บันทึก order ผ่าน Repository (ไม่มี SQL ที่นี่)
  const order = await orderRepository.createOrder({
    userEmail:  email,
    totalPrice: total,
  });

  return {
    orderId: order.id,
    total:   total.toFixed(2),
  };
}

module.exports = { placeOrder };
