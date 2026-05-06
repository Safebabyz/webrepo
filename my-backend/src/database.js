const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// สร้างไฟล์ชื่อ store.db ไว้ในโฟลเดอร์โครงการ
const dbPath = path.resolve(__dirname, '../store.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error(err.message);
    console.log('เชื่อมต่อ store.db สำเร็จ!');
});

// สร้างตารางสำหรับเก็บข้อมูลสั่งซื้อ (Orders)
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT,
        total_price REAL,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

module.exports = db;