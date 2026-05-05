const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// นำเข้า Routes
let productRoutes;
let authRoutes; // เพิ่มตัวแปรสำหรับ Auth

try {
    productRoutes = require('./routes/products');
    authRoutes = require('./routes/auth'); // นำเข้า authRoutes
} catch (err) {
    console.error('Failed to require routes:', err);
    process.exit(1);
}

app.use('/api/products', productRoutes);
app.use('/api', authRoutes); // ใช้งานที่ /api จะได้ Path เป็น /api/register

app.get('/', (req, res) => {
    res.send('Architectural Server is running!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});