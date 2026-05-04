const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// นำเข้า Routes (ตรวจสอบ Path ให้ถูกต้องตามโครงสร้างไฟล์)
let productRoutes;
try {
    productRoutes = require('./routes/products');
} catch (err) {
    console.error('Failed to require ./routes/products:', err);
    process.exit(1);
}
app.use('/api/products', productRoutes);

// DEBUG: แสดงว่า mount สำเร็จหรือไม่ และพิมพ์รายการ routes ที่แอปลงทะเบียนไว้
console.log('Mounted /api/products ->', typeof productRoutes);
if (app._router && Array.isArray(app._router.stack)) {
    console.log('Registered routes:');
    app._router.stack.forEach(layer => {
        if (layer.route && layer.route.path) {
            const methods = Object.keys(layer.route.methods || {}).join(',').toUpperCase();
            console.log(`${methods} ${layer.route.path}`);
        }
    });
}

// TEMP: เส้นทางทดสอบโดยตรง (ไม่ผ่าน router) เพื่อตรวจว่าคำขอถึงแอปจริง
app.get('/api/products/test', (req, res) => {
    res.json({ ok: true, message: 'products test route reachable' });
});

app.get('/', (req, res) => {
    res.send('Architectural Server is running!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});