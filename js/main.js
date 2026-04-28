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
            renderUI(products);
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
     * - Renders an array of product objects into the container with id="product-container".
     * - Each product is expected to have at least: id, name, price, image_url (per your requested JSON).
     *
     * @param {Array} products
     */
    function renderUI(products) {
        const container = document.getElementById('product-container');
        if (!container) {
            console.error('renderUI: #product-container element not found.');
            return;
        }
    
        // Clear previous content
        container.innerHTML = '';
    
        // If products is empty or not an array, show a friendly message
        if (!Array.isArray(products) || products.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-muted">No products available.</p></div>';
            return;
        }
    
        // Build DOM nodes for each product and append to the container
        products.forEach(p => {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6 col-sm-12 pb-1';
    
            // Use escapeHtml for user-controlled strings
            const imgSrc = escapeHtml(p.image_url || p.image || '');
            const name = escapeHtml(p.name || 'Unnamed product');
            const price = (typeof p.price === 'number' || !isNaN(Number(p.price))) ? Number(p.price).toFixed(2) : '';
    
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
    
    // Automatically request products when the DOM is ready.
    // This matches the common UI flow: page loads -> requestProducts -> fetchData -> renderUI
    document.addEventListener('DOMContentLoaded', () => {
        // If you want to call requestProducts from other places (e.g. on-demand refresh), call this function directly.
        requestProducts('data/products.json').catch(err => {
            // Error already rendered by requestProducts/renderError; still log for debugging.
            console.error('requestProducts failed:', err);
        });
    });
    
})(jQuery);

