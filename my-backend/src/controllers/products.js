const productService = require('../services/products');

/**
 * Controller: GET /api/products
 * - อ่าน query parameter ?category=...
 * - เรียก service ที่เหมาะสมและส่ง JSON response { status, data }
 */
async function getProducts(req, res) {
    try {
        const category = req.query.category;
        let result;
        if (category) {
            result = await productService.getProductsByCategory(category);
        } else {
            result = await productService.getAllProducts();
        }

        return res.status(200).json({
            status: "Success",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            status: "Fail",
            message: error.message
        });
    }
}

module.exports = { getProducts };