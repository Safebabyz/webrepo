const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('ระบบหลังบ้านทำงานได้แล้ว!');
});

app.listen(port, () => {
  console.log(`Server กำลังทำงานที่ http://localhost:${port}`);
});