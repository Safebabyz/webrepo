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
    function filterProducts(searchTerm, category) {
        const term = (searchTerm || '').trim().toLowerCase();
        const cat = (category || 'All').trim().toLowerCase();

        if (!Array.isArray(originalProducts)) return [];

        return originalProducts.filter(product => {
            if (!product || typeof product.name !== 'string') return false;
            const nameMatches = term === '' || product.name.toLowerCase().includes(term);
            const categoryMatches = cat === 'all' ||
                (typeof product.category === 'string' && product.category.toLowerCase() === cat);
            return nameMatches && categoryMatches;
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
    
})(jQuery);

