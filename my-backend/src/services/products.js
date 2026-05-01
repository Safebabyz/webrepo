const fs = require('fs');
const path = require('path');

// กำหนดที่อยู่ของไฟล์ JSON
const productsFilePath = path.join(__dirname, '../../data/products.json');

const getAllProducts = () => {
    const rawData = fs.readFileSync(productsFilePath); // อ่านไฟล์
    return JSON.parse(rawData); // แปลงเป็น Object ของ JavaScript
};

module.exports = { getAllProducts };