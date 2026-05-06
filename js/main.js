(function ($) {
    "use strict";
    
    let originalProducts = []; // เก็บข้อมูลสินค้าต้นฉบับ
    let allProducts = [];      // เก็บข้อมูลสินค้าที่กำลังแสดงผล

    // 1. จัดการ Navbar และ UI ทั่วไป
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);

        // ดักจับฟอร์มสมัครสมาชิก
        $('#register-form').on('submit', handleRegister);
        
        // ดักจับฟอร์ม Checkout (ถ้ามีปุ่ม ID นี้ในหน้า checkout.html)
        $('#checkout-form').on('submit', handleCheckout);
    });

    // 2. ระบบดึงข้อมูลสินค้า
    async function fetchData(path) {
        const resp = await fetch(path, { cache: 'no-store' });
        if (!resp.ok) throw new Error(`Network error: ${resp.status}`);
        return await resp.json();
    }

    async function requestProducts(jsonPath = 'data/products.json') {
        try {
            const products = await fetchData(jsonPath);
            originalProducts = Array.isArray(products) ? products.slice() : [];
            renderUI(originalProducts);
            return products;
        } catch (err) {
            renderError('Failed to load products.');
            throw err;
        }
    }

    function renderUI(products) {
        allProducts = Array.isArray(products) ? products.slice() : [];
        const container = document.getElementById('product-container') || document.querySelector('.col-lg-9 .row.pb-3');
        if (!container) return;

        container.innerHTML = '';
        if (products.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-muted text-center py-5">No products available.</p></div>';
            return;
        }

        products.forEach(p => {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6 col-sm-12 pb-1';
            col.innerHTML = `
                <div class="card product-item border-0 mb-4" data-id="${p.id}">
                    <div class="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                        <img class="img-fluid w-100" src="${p.image || 'img/product-1.jpg'}" alt="${p.name}">
                    </div>
                    <div class="card-body border-left border-right text-center p-0 pt-4 pb-3">
                        <h6 class="text-truncate mb-3">${p.name}</h6>
                        <div class="d-flex justify-content-center"><h6>$${Number(p.price).toFixed(2)}</h6></div>
                    </div>
                    <div class="card-footer d-flex justify-content-between bg-light border">
                        <a href="#" class="btn btn-sm text-dark p-0"><i class="fas fa-eye text-primary mr-1"></i>View Detail</a>
                        <button class="btn btn-sm text-dark p-0 add-to-cart" data-id="${p.id}">
                            <i class="fas fa-shopping-cart text-primary mr-1"></i>Add To Cart
                        </button>
                    </div>
                </div>`;
            container.appendChild(col);
        });
    }

    // 3. ระบบตะกร้าสินค้า
    function addToCart(productID) {
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const id = Number(productID);
        const existing = cart.find(item => Number(item.id) === id);

        if (existing) {
            existing.quantity += 1;
        } else {
            const product = allProducts.find(p => Number(p.id) === id);
            if (!product) return;
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartBadge();
        alert("Added to cart!");
    }

    function updateCartBadge() {
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const totalCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        $('.fa-shopping-cart').next('.badge').text(totalCount);
    }

    // 4. ระบบ Register & Checkout
    function validateRegister(name, email, password) {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!name || !email || !password) { alert("Please fill all fields"); return false; }
        if (!passwordRegex.test(password)) { alert("Password must be 8+ chars, 1 uppercase, 1 special char"); return false; }
        return true;
    }

    async function handleRegister(e) {
        e.preventDefault();
        const data = { name: $('#reg-name').val(), email: $('#reg-email').val(), password: $('#reg-password').val() };
        if (!validateRegister(data.name, data.email, data.password)) return;

        try {
            const resp = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (resp.ok) { alert("Register Success!"); window.location.href = 'login.html'; }
            else { const res = await resp.json(); alert("Fail: " + res.message); }
        } catch (err) { alert("Server error"); }
    }

    async function handleCheckout(event) {
        event.preventDefault();
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const payload = { cart, email: $('#email').val(), creditCard: $('#credit-card').val() };

        try {
            const response = await fetch('http://localhost:3000/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (response.status === 400) { alert("Error: " + result.message); } 
            else if (response.ok) { alert("Success! Total: $" + result.total); localStorage.removeItem('shoppingCart'); window.location.href = 'index.html'; }
        } catch (err) { alert("Connection failed"); }
    }
    /**
 * ฟังก์ชันสำหรับแสดงสรุปรายการสินค้าในหน้า Checkout
 */
function renderCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const container = document.getElementById('order-products-list'); // ID ตรงกับที่แก้ใน HTML
    const subtotalElement = document.getElementById('order-subtotal');
    const totalElement = document.getElementById('order-total-amount');

    if (!container) return; // ถ้าไม่ใช่หน้า Checkout ไม่ต้องรัน

    container.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        // ล้างตัวเลขราคา (ลบ $ และ ,) เพื่อนำมาคำนวณ
        const price = parseFloat(item.price.replace(/[$,]/g, ''));
        const itemTotal = price * (item.quantity || 1);
        subtotal += itemTotal;

        // สร้าง HTML แสดงรายชื่อสินค้าและราคาแต่ละชิ้น
        const div = document.createElement('div');
        div.className = 'd-flex justify-content-between';
        div.innerHTML = `<p>${item.name} x ${item.quantity || 1}</p><p>$${itemTotal.toFixed(2)}</p>`;
        container.appendChild(div);
    });

    // แสดงผลราคารวมในหน้าจอ
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${(subtotal + 10).toFixed(2)}`; // บวกค่าส่ง $10
}

    // 5. เริ่มต้นการทำงาน
document.addEventListener('DOMContentLoaded', () => {
    requestProducts();
    updateCartBadge();
    renderCheckoutSummary(); // เพิ่มบรรทัดนี้ เพื่อให้หน้า Checkout แสดงข้อมูลจริง
    
    // Event delegation สำหรับปุ่ม Add to Cart
    $(document).on('click', '.add-to-cart', function() {
        addToCart($(this).data('id'));
    });
});

    // ส่งออกฟังก์ชันไปที่ window
    window.updateCartBadge = updateCartBadge;

})(jQuery);