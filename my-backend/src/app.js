const express = require('express');
const productsRouter = require('./routes/products');

const app = express();
app.use(express.json());

// mount API
app.use('/api/products', productsRouter);

// เริ่มเซิร์ฟเวอร์ (ตัวอย่าง)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));