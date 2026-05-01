const express = require('express');
const app = express();
const productRoutes = require('./routes/products');

app.use(express.json());

// ใช้งาน Route ที่เราสร้างไว้
app.use('/api/products', productRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/api/products`);
});