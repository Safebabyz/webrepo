(function ($) {
    "use strict";
    
    // Dropdown on mouse hover
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
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Vendor carousel
    $('.vendor-carousel').owlCarousel({
        loop: true,
        margin: 29,
        nav: false,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
            0:{
                items:2
            },
            576:{
                items:3
            },
            768:{
                items:4
            },
            992:{
                items:5
            },
            1200:{
                items:6
            }
        }
    });


    // Related carousel
    $('.related-carousel').owlCarousel({
        loop: true,
        margin: 29,
        nav: false,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:2
            },
            768:{
                items:3
            },
            992:{
                items:4
            }
        }
    });
    
    /*
      Sequence implemented:
        1. requestProducts(path)        - entry point called by UI (or on DOMContentLoaded)
        2. fetchData(path)              - performs fetch(path) and returns parsed JSON
        3. renderUI(products)           - receives data and updates #product-container DOM
    
      Data flow:
        requestProducts -> fetchData (HTTP GET path) -> parsed JSON -> renderUI (DOM update)
        Any error during fetch/parsing is propagated back and handled to render an error UI message.
    */
    
    // Small helper to escape potentially unsafe text before injecting into HTML
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c]));
    }
    
    /**
     * requestProducts
     * - High-level function that orchestrates the product loading sequence.
     * - Calls fetchData to retrieve the JSON, then calls renderUI to display results.
     * - Returns a Promise that resolves once rendering is complete or rejects on error.
     *
     * @param {string} jsonPath - relative/absolute path to the JSON file (default: data/products.json)
     */
    async function requestProducts(jsonPath = 'data/products.json') {
        // This is the function your sequence diagram calls first.
        // It centralizes error handling and keeps UI logic (renderUI) separate from network logic (fetchData).
        try {
            const products = await fetchData(jsonPath);
            // save master copy so searches always operate on full list
            originalProducts = Array.isArray(products) ? products.slice() : [];
            // render initial UI from full list
            renderUI(originalProducts);
            return products;
        } catch (err) {
            // Bubble up error after attempting to show a simple error UI
            renderError('Failed to load products. Please try again later.');
            throw err;
        }
    }
    
    /**
     * fetchData
     * - Low level network function that performs fetch(path) and returns parsed JSON.
     * - Throws if network response is not ok or JSON parsing fails.
     *
     * @param {string} path
     * @returns {Promise<Array|Object>} parsed JSON
     */
    async function fetchData(path) {
        // Perform the network request. Caller is responsible for handling any thrown errors.
        const resp = await fetch(path, { cache: 'no-store' });
        if (!resp.ok) {
            throw new Error(`Network error: ${resp.status} ${resp.statusText}`);
        }
        // Parse JSON (may throw if invalid)
        return await resp.json();
    }
    
    /**
     * renderUI
     * - now renders given products but DOES NOT overwrite the master originalProducts
     */
    function renderUI(products) {
        // keep a copy of what we're currently rendering (optional)
        allProducts = Array.isArray(products) ? products.slice() : [];

        const container = document.getElementById('product-container') ||
            document.querySelector('.col-lg-9 .row.pb-3');

        if (!container) {
            console.error('renderUI: no product container found.');
            return;
        }

        // Clear existing product columns
        container.innerHTML = '';

        if (!Array.isArray(products) || products.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-muted">No products available.</p></div>';
            return;
        }

        products.forEach(p => {
            const imgSrc = escapeHtml(p.image_url || p.image || 'img/product-1.jpg');
            const name = escapeHtml(p.name || 'Unnamed product');
            const price = (typeof p.price === 'number' || !isNaN(Number(p.price))) ? Number(p.price).toFixed(2) : '';
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6 col-sm-12 pb-1';

            col.innerHTML = `
                <div class="card product-item border-0 mb-4">
                    <div class="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                        <img class="img-fluid w-100" src="${imgSrc}" alt="${name}">
                    </div>
                    <div class="card-body border-left border-right text-center p-0 pt-4 pb-3">
                        <h6 class="text-truncate mb-3">${name}</h6>
                        <div class="d-flex justify-content-center">
                            <h6>$${price}</h6>
                        </div>
                    </div>
                    <div class="card-footer d-flex justify-content-between bg-light border">
                        <a href="#" class="btn btn-sm text-dark p-0"><i class="fas fa-eye text-primary mr-1"></i>View Detail</a>
                        <a href="#" class="btn btn-sm text-dark p-0"><i class="fas fa-shopping-cart text-primary mr-1"></i>Add To Cart</a>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    }
    
    /**
     * renderError
     * - Helper to show a small error message inside #product-container when loading fails.
     *
     * @param {string} message
     */
    function renderError(message) {
        const container = document.getElementById('product-container');
        if (!container) return;
        container.innerHTML = `<div class="col-12"><p class="text-danger">${escapeHtml(message)}</p></div>`;
    }
    
    // fetch JSON, parse it and render
    async function load() {
      try {
        const resp = await fetch('data/products.json');
        if (!resp.ok) throw new Error(resp.statusText);
        const products = await resp.json(); // products is now an Array/Object
        renderUI(products); // update DOM
      } catch (err) {
        console.error('Load failed:', err);
      }
    }
    
    // store loaded products for filtering (master copy)
    let originalProducts = [];
    // current rendered set (optional)
    let allProducts = [];

    /**
     * requestProducts
     * - High-level function that orchestrates the product loading sequence.
     */
    async function requestProducts(jsonPath = 'data/products.json') {
        try {
            const products = await fetchData(jsonPath);
            // save master copy so searches always operate on full list
            originalProducts = Array.isArray(products) ? products.slice() : [];
            // render initial UI from full list
            renderUI(originalProducts);
            return products;
        } catch (err) {
            renderError('Failed to load products. Please try again later.');
            throw err;
        }
    }

    /**
     * renderUI
     * - now renders given products but DOES NOT overwrite the master originalProducts
     */
    function renderUI(products) {
        // keep a copy of what we're currently rendering (optional)
        allProducts = Array.isArray(products) ? products.slice() : [];

        const container = document.getElementById('product-container') ||
            document.querySelector('.col-lg-9 .row.pb-3');

        if (!container) {
            console.error('renderUI: no product container found.');
            return;
        }

        // Clear existing product columns
        container.innerHTML = '';

        if (!Array.isArray(products) || products.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-muted">No products available.</p></div>';
            return;
        }

        products.forEach(p => {
            const imgSrc = escapeHtml(p.image_url || p.image || 'img/product-1.jpg');
            const name = escapeHtml(p.name || 'Unnamed product');
            const price = (typeof p.price === 'number' || !isNaN(Number(p.price))) ? Number(p.price).toFixed(2) : '';
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6 col-sm-12 pb-1';

            col.innerHTML = `
                <div class="card product-item border-0 mb-4">
                    <div class="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                        <img class="img-fluid w-100" src="${imgSrc}" alt="${name}">
                    </div>
                    <div class="card-body border-left border-right text-center p-0 pt-4 pb-3">
                        <h6 class="text-truncate mb-3">${name}</h6>
                        <div class="d-flex justify-content-center">
                            <h6>$${price}</h6>
                        </div>
                    </div>
                    <div class="card-footer d-flex justify-content-between bg-light border">
                        <a href="#" class="btn btn-sm text-dark p-0"><i class="fas fa-eye text-primary mr-1"></i>View Detail</a>
                        <a href="#" class="btn btn-sm text-dark p-0"><i class="fas fa-shopping-cart text-primary mr-1"></i>Add To Cart</a>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    }

    /**
     * filterProducts(searchTerm, category)
     * - Use originalProducts (full list) as the source so repeated searches work correctly.
     */
   /**
 * filterProducts(searchTerm, category)
 * ใช้ข้อมูลจาก originalProducts (ต้นฉบับ) เพื่อให้การค้นหาใหม่เริ่มจากรายการทั้งหมดเสมอ
 */
function filterProducts(searchTerm, category) {
    const term = (searchTerm || '').trim().toLowerCase();
    const cat = (category || 'All').trim().toLowerCase();

    if (!Array.isArray(originalProducts)) return [];

    return originalProducts.filter(product => {
        if (!product || typeof product.name !== 'string') return false;

        // Logic 1: ค้นหาจากชื่อสินค้า
        const nameMatches = term === '' || product.name.toLowerCase().includes(term);

        // Logic 2: ค้นหาจากหมวดหมู่ (ถ้าเป็น 'all' ให้ผ่านทุกชิ้น)
        const productCategory = (product.category || '').toLowerCase();
        const categoryMatches = cat === 'all' || productCategory === cat;

        return nameMatches && categoryMatches; // ต้องตรงทั้งสองอย่าง
    });
}

/**
 * renderUI
 * ปรับปรุงการสร้าง HTML ให้มี class 'product-item' เพื่อให้ระบบ Add to Cart ทำงานต่อได้[cite: 8]
 */
function renderUI(products) {
    const container = document.getElementById('product-container') ||
                      document.querySelector('.col-lg-9 .row.pb-3');

    if (!container) return;

    container.innerHTML = ''; // ล้างหน้าจอ[cite: 8]

    if (products.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted text-center py-5">No products available.</p></div>';
        return;
    }

    products.forEach(p => {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 col-sm-12 pb-1';
        
        // ใส่ข้อมูลสินค้าลงใน Template[cite: 8]
        col.innerHTML = `
            <div class="card product-item border-0 mb-4" data-id="${p.id}">
                <div class="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                    <img class="img-fluid w-100" src="${p.image || 'img/product-1.jpg'}" alt="${p.name}">
                </div>
                <div class="card-body border-left border-right text-center p-0 pt-4 pb-3">
                    <h6 class="text-truncate mb-3">${p.name}</h6>
                    <div class="d-flex justify-content-center">
                        <h6>$${Number(p.price).toFixed(2)}</h6>
                    </div>
                </div>
                <div class="card-footer d-flex justify-content-between bg-light border">
                    <a href="#" class="btn btn-sm text-dark p-0"><i class="fas fa-eye text-primary mr-1"></i>View Detail</a>
                    <button class="btn btn-sm text-dark p-0 add-to-cart" data-id="${p.id}">
                        <i class="fas fa-shopping-cart text-primary mr-1"></i>Add To Cart
                    </button>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

    /**
     * setupSearchAndFilters
     * - Wire search input, button and category list to call filterProducts() and re-render results.
     * - Add debug logs to help find why search returns no results.
     */
    function setupSearchAndFilters() {
        const searchInput = document.getElementById('product-search');
        const searchBtn = document.getElementById('product-search-btn');
        const categoryList = document.getElementById('category-list');

        if (!categoryList) {
            console.warn('setupSearchAndFilters: #category-list not found in DOM');
        }
        if (!searchInput) {
            console.warn('setupSearchAndFilters: #product-search not found in DOM');
        }

        function doFilter() {
            const term = searchInput ? searchInput.value : '';
            let cat = 'All';
            if (categoryList) {
                const active = categoryList.querySelector('.active[data-category]');
                if (active) cat = active.getAttribute('data-category') || (active.textContent || 'All').trim();
            }

            // Debug: show what we're filtering against and how many source items exist
            console.debug('Filtering products — term:', term, 'category:', cat, 'originalProducts.length:', originalProducts.length);

            const results = filterProducts(term, cat);

            console.debug('Filter results length:', results.length, results.slice(0,3)); // preview up to 3 items
            renderUI(results);
        }

        if (searchInput) {
            // update on keyup and on Enter
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    doFilter();
                } else {
                    doFilter();
                }
            });
        }
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => { e.preventDefault(); doFilter(); });
        }

        if (categoryList) {
            // Use event delegation and robust target resolution
            categoryList.addEventListener('click', (e) => {
                let target = e.target;
                const item = target.closest('[data-category]') || target.closest('a') || target.closest('.list-group-item');
                if (!item) return;

                e.preventDefault();

                const cat = (item.getAttribute && item.getAttribute('data-category')) ||
                            (item.dataset && item.dataset.category) ||
                            (item.textContent || '').trim() || 'All';

                categoryList.querySelectorAll('[data-category], .list-group-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');

                console.debug('Category clicked:', cat);

                const term = searchInput ? searchInput.value : '';
                const results = filterProducts(term, cat);
                console.debug('After category click - results length:', results.length);
                renderUI(results);
            });
        }
    }
    

    // Automatically request products when the DOM is ready.
    document.addEventListener('DOMContentLoaded', () => {
        console.debug('DOMContentLoaded - starting product request');
        requestProducts('data/products.json').then(() => {
            console.debug('Products loaded, originalProducts.length =', originalProducts.length, 'first item:', originalProducts[0] || null);
        }).catch(err => {
            console.error('requestProducts failed:', err);
        }).finally(() => {
            // set up search/category handlers even if load failed
            setupSearchAndFilters();
        });
    });
    
// switch to array-based cart (each item: { id, name, price, quantity, ... })
let cart = [];

/**
 * addToCart(productID)
 * - Manage the in-memory array `cart`.
 * - Use Array.prototype.find() to see if product already in cart:
 *     - if found -> increment its quantity
 *     - if not found -> locate product in allProducts, clone it, set quantity=1 and push
 * - After updating call saveToLocalStorage() and updateCartUI()
 *
 * @param {number|string} productID
 */
function addToCart(productID) {
    const id = Number(productID);
    if (Number.isNaN(id)) {
        console.warn('addToCart: invalid productID', productID);
        return;
    }

    // Try to find existing cart entry
    const existing = cart.find(item => Number(item.id) === id);

    if (existing) {
        // Increment quantity for existing cart item
        existing.quantity = (existing.quantity || 0) + 1;
    } else {
        // Find product definition from allProducts (source dataset)
        const product = Array.isArray(allProducts) ? allProducts.find(p => Number(p.id) === id) : null;
        if (!product) {
            console.warn('addToCart: product not found in allProducts', id);
            return;
        }

        // Clone the product object (avoid mutating source) and ensure a quantity field
        const item = Object.assign({}, product);
        item.quantity = item.quantity && Number(item.quantity) > 0 ? Number(item.quantity) : 1;

        cart.push(item);
    }

    // Persist and refresh UI
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
    if (typeof updateCartUI === 'function') updateCartUI();
}

/**
 * handleCatalogClick(e)
 * - Event delegation handler attached to the parent #catalog.
 * - Looks for a clicked element (or its ancestor) with class .add-to-cart,
 *   reads its data-id attribute, and calls addToCart().
 */
function handleCatalogClick(e) {
    // Find the nearest ancestor (or self) with the .add-to-cart class
    const btn = e.target.closest && e.target.closest('.add-to-cart');
    if (!btn) return; // click wasn't on an add-to-cart button

    // Read the product id from data-id attribute
    // Supports both data-id and dataset.id
    const rawId = btn.getAttribute('data-id') ?? btn.dataset?.id;
    if (!rawId) {
        console.warn('.add-to-cart clicked but no data-id found', btn);
        return;
    }

    const productId = parseInt(rawId, 10);
    if (Number.isNaN(productId)) {
        console.warn('Invalid product id on .add-to-cart:', rawId);
        return;
    }

    // Optionally read quantity from data-qty attribute or button dataset
    const rawQty = btn.getAttribute('data-qty') ?? btn.dataset?.qty;
    const qty = rawQty ? Math.max(1, parseInt(rawQty, 10) || 1) : 1;

    // Update cart
    addToCart(productId, qty);
}

/**
 * wireCatalogDelegation()
 * - Attaches a single click listener to #catalog that delegates to .add-to-cart buttons.
 * - Safe to call multiple times (will remove prior listener first).
 */
function wireCatalogDelegation() {
    const parent = document.getElementById('catalog');
    if (!parent) {
        console.warn('wireCatalogDelegation: #catalog not found in DOM');
        return;
    }
    // Remove old listener if present (avoid duplicate handlers)
    parent.removeEventListener('click', handleCatalogClick);
    parent.addEventListener('click', handleCatalogClick);
}

// Example: update a badge UI when cart changes (optional)
window.addEventListener('cart:updated', (e) => {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    // Sum quantities to show total items
    const totalItems = Object.values(e.detail.cart).reduce((s, q) => s + q, 0);
    badge.textContent = String(totalItems);
});

// Call wiring after DOM is ready
document.addEventListener('DOMContentLoaded', wireCatalogDelegation);

})(jQuery);
// ฟังก์ชันสำหรับอัปเดตจำนวนสินค้าในตะกร้า
function updateCartBadge() {
    // 1. ดึงข้อมูลสินค้าจาก LocalStorage
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    
    // 2. คำนวณจำนวนชิ้นทั้งหมด (รวม quantity ของทุกรายการ)[cite: 1, 8]
    const totalCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    
    // 3. นำตัวเลขไปแสดงผลในคลาส .badge ที่อยู่คู่กับไอคอนตะกร้า[cite: 4, 8]
    $('.fa-shopping-cart').next('.badge').text(totalCount);
}

// เรียกใช้งานฟังก์ชันทันทีเมื่อโหลดหน้าเว็บเพื่อให้เลขแสดงผลทุกหน้า[cite: 8]
updateCartBadge();

// ส่งออกฟังก์ชันไปยัง window เพื่อให้ไฟล์ HTML เรียกใช้ได้เมื่อมีการลบสินค้า
window.updateCartBadge = updateCartBadge;
// --- ส่วนที่เพิ่มใหม่สำหรับระบบ Register ---

/**
 * validateRegister(name, email, password)
 * ตรวจสอบเงื่อนไขตาม Logic: ยาว >= 8, มีตัวพิมพ์ใหญ่ 1, มีอักขระพิเศษ 1
 */
function validateRegister(name, email, password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!name || !email || !password) {
        alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        return false;
    }

    if (!passwordRegex.test(password)) {
        alert("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร, มีตัวพิมพ์ใหญ่ 1 ตัว และอักขระพิเศษ 1 ตัว");
        return false;
    }
    return true;
}

// ฟังก์ชันสำหรับส่งข้อมูลสมัครสมาชิก
async function handleRegister(e) {
    e.preventDefault();

    const name = $('#reg-name').val();
    const email = $('#reg-email').val();
    const password = $('#reg-password').val();

    // 1. ตรวจสอบรหัสผ่านที่หน้าบ้านก่อน (Frontend Check)
    if (!validateRegister(name, email, password)) return;

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const result = await response.json();

        if (response.ok) {
            alert("ลงทะเบียนสำเร็จ!");
            window.location.href = 'login.html'; // ส่งไปหน้า Login เมื่อสำเร็จ
        } else {
            alert("การลงทะเบียนล้มเหลว: " + result.message); // เช่น อีเมลซ้ำ (Backend Check)
        }
    } catch (error) {
        console.error("Register Error:", error);
        alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
}

// เชื่อมโยงเหตุการณ์กับฟอร์มสมัครสมาชิก (ถ้ามีฟอร์มในหน้านั้น)
$(document).ready(function() {
    $('#register-form').on('submit', handleRegister);
});







