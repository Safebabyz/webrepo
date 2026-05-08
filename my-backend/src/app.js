'use strict';

/**
 * app.js — Application Entry Point (REFACTORED)
 * -------------------------------------------------------
 * BEFORE: ใช้ routes/auth.js และ routes/products.js (ชื่อเดิม)
 * AFTER:  ใช้ routes/authRoutes, productRoutes, orderRoutes (ชัดเจนขึ้น)
 *
 * ทุก route เชื่อม prefix ที่ตรงกับ domain ของ microservice:
 *   /api         → Identity (login/register)
 *   /api/products → Catalog (products)
 *   /api         → Orders  (checkout)
 */

const express       = require('express');
const app           = express();
const port          = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(express.json());

// CORS: อนุญาตให้ frontend เรียกได้ (ปรับ origin ตาม environment)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
let authRoutes, productRoutes, orderRoutes;

try {
  authRoutes    = require('./routes/authRoutes');
  productRoutes = require('./routes/productRoutes');
  orderRoutes   = require('./routes/orderRoutes');
} catch (err) {
  console.error('Failed to load routes:', err);
  process.exit(1);
}

app.use('/api', authRoutes);             // POST /api/login, /api/register
app.use('/api/products', productRoutes); // GET  /api/products, /api/products/:id
app.use('/api', orderRoutes);            // POST /api/checkout

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/', (_req, res) => {
  res.json({
    status:  'ok',
    message: 'EShopper API Server is running!',
    version: '2.0.0',
    architecture: 'Layered (Repository → Service → Controller)',
  });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ status: 'Fail', message: 'Internal server error.' });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`✅ EShopper API running at http://localhost:${port}`);
  console.log('   Architecture: Repository → Service → Controller → Route');
});