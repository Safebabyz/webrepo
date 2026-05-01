const productService = require('../services/products');

const getProducts = (req, res) => {
    try {
        const products = productService.getAllProducts();
        res.status(200).json(products); // ส่งข้อมูลกลับเป็น JSON
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
};

module.exports = { getProducts };