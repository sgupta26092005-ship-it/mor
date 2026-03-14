document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    // allProducts should be globally available from products.js
    if (!window.allProducts || !productId) {
        document.querySelector('main').innerHTML = '<h1>Product not found</h1><a href="shop.html">Go back to shop</a>';
        return;
    }

    const product = window.allProducts.find(p => p.id === productId);

    if (!product) {
        document.querySelector('main').innerHTML = '<h1>Product not found</h1><a href="shop.html">Go back to shop</a>';
        return;
    }

    // --- Populate Page with Product Data ---
    document.title = `${product.name} - Mor`;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = product.price;
    
    const oldPriceEl = document.getElementById('product-old-price');
    const saveAmountEl = document.getElementById('product-save-amount');
    
    if (product.oldPrice) {
        oldPriceEl.textContent = product.oldPrice;
        const priceNum = parseFloat(product.price.replace(/[^0-9.-]+/g,""));
        const oldPriceNum = parseFloat(product.oldPrice.replace(/[^0-9.-]+/g,""));
        if (!isNaN(priceNum) && !isNaN(oldPriceNum)) {
            saveAmountEl.textContent = `Save ₹${(oldPriceNum - priceNum).toFixed(0)}`;
        }
        oldPriceEl.style.display = 'inline';
        saveAmountEl.style.display = 'inline';
    } else {
        oldPriceEl.style.display = 'none';
        saveAmountEl.style.display = 'none';
    }

    // Accordion Content
    document.getElementById('accordion-description').innerHTML = `<p>${product.description}</p>`;
    document.getElementById('accordion-specification').innerHTML = `<p>${product.specification}</p>`;

    // --- Gallery ---
    const sliderTrack = document.getElementById('gallery-slider-track');
    const dotsContainer = document.getElementById('gallery-dots-container');
    const sliderContainer = document.querySelector('.gallery-slider-container');
    const galleryImages = product.galleryImages || [product.imgSrc];
    let currentImageIndex = 0;

    sliderTrack.innerHTML = '';
    dotsContainer.innerHTML = '';

    galleryImages.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${product.name} image ${index + 1}`;
        img.loading = 'lazy';
        sliderTrack.appendChild(img);

        const dot = document.createElement('span');
        dot.className = 'gallery-dot';
        if (index === 0) dot.classList.add('active');
        dot.dataset.index = index;
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.gallery-dot');

    function showImage(index) {
        sliderTrack.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach(d => d.classList.remove('active'));
        if(dots[index]) dots[index].classList.add('active');
        currentImageIndex = index;
    }

    dotsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('gallery-dot')) {
            showImage(parseInt(e.target.dataset.index));
        }
    });

    // --- Swipe functionality for gallery ---
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;

    const handleSwipe = () => {
        if (touchEndX === 0 || Math.abs(touchEndX - touchStartX) < 50) return; // Swipe threshold
        if (touchEndX < touchStartX) { // Swiped left
            showImage((currentImageIndex + 1) % galleryImages.length);
        } else { // Swiped right
            showImage((currentImageIndex - 1 + galleryImages.length) % galleryImages.length);
        }
        touchStartX = 0;
        touchEndX = 0;
    };

    const mouseUpHandler = () => {
        if (!isSwiping) return;
        isSwiping = false;
        sliderContainer.style.cursor = 'grab';
        sliderContainer.style.userSelect = '';
        handleSwipe();
    };

    // Touch events
    sliderContainer.addEventListener('touchstart', (e) => { isSwiping = true; touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    sliderContainer.addEventListener('touchmove', (e) => { if (isSwiping) touchEndX = e.changedTouches[0].screenX; }, { passive: true });
    sliderContainer.addEventListener('touchend', () => { if (isSwiping) { isSwiping = false; handleSwipe(); } });

    // Mouse events for desktop dragging
    sliderContainer.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent default image drag behavior
        isSwiping = true;
        touchStartX = e.screenX;
        sliderContainer.style.cursor = 'grabbing';
        sliderContainer.style.userSelect = 'none';
    });
    sliderContainer.addEventListener('mousemove', (e) => {
        if (isSwiping) touchEndX = e.screenX;
    });
    sliderContainer.addEventListener('mouseup', mouseUpHandler);
    sliderContainer.addEventListener('mouseleave', mouseUpHandler);


    // --- Size Selector ---
    const sizeSelector = document.getElementById('size-selector');
    sizeSelector.innerHTML = '';
    (product.sizes || ['One Size']).forEach((size, index) => {
        const btn = document.createElement('button');
        btn.className = 'size-btn';
        if (index === 0) btn.classList.add('active');
        btn.textContent = size;
        sizeSelector.appendChild(btn);
    });

    sizeSelector.addEventListener('click', (e) => {
        if (e.target.classList.contains('size-btn')) {
            sizeSelector.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
        }
    });

    // --- Quantity Counter ---
    const quantityValue = document.querySelector('.quantity-value');
    document.getElementById('quantity-counter').addEventListener('click', (e) => {
        if (e.target.classList.contains('quantity-btn')) {
            let currentQty = parseInt(quantityValue.textContent);
            if (e.target.dataset.action === 'increase') {
                currentQty++;
            } else if (currentQty > 1) {
                currentQty--;
            }
            quantityValue.textContent = currentQty;
        }
    });

    // --- Add to Cart ---
    document.getElementById('add-to-cart-btn').addEventListener('click', () => {
        const productForCart = {
            id: product.id, // The base product ID
            name: product.name,
            price: product.price,
            size: sizeSelector.querySelector('.size-btn.active').textContent,
            imgSrc: product.imgSrc,
            quantity: parseInt(quantityValue.textContent),
            pageUrl: product.pageUrl
        };

        // Use the flyToCart animation which now handles adding the item
        const startElement = document.getElementById('add-to-cart-btn');
        window.flyToCart(startElement, productForCart);
    });

    // --- Accordion ---
    document.querySelectorAll('.modern-accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const icon = header.querySelector('i');
            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
                icon.className = 'fas fa-minus';
            } else {
                content.style.maxHeight = null;
                icon.className = 'fas fa-plus';
            }
        });
    });

    // --- Favorite Button ---
    const favIconContainer = document.getElementById('page-favorite-icon');
    if (window.isFavorited && window.isFavorited(product)) {
        favIconContainer.innerHTML = '<i class="fas fa-heart"></i>';
    }
    favIconContainer.addEventListener('click', () => {
        // Use the toggleFavorite wrapper from mor.js to ensure consistent UI updates.
        // This wrapper correctly calls the backend function from fav.js and handles the icon state.
        // The global `toggleFavorite` in mor.js expects (product, iconElement).
        window.toggleFavorite && window.toggleFavorite(product, favIconContainer);
    });

    // --- Share Button ---
    document.getElementById('share-btn')?.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: `Check out this ${product.name}!`,
                url: window.location.href
            }).catch(() => window.showToast('Sharing failed.', 'fa-exclamation-triangle'));
        } else {
            window.showToast('Sharing is not supported on your browser.', 'fa-exclamation-triangle');
        }
    });

    // --- Related Products ---
    const relatedProductsContainer = document.getElementById('related-products-container');
    const relatedProducts = window.allProducts
        .filter(p => p.id !== productId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);

    relatedProductsContainer.innerHTML = '';
    relatedProducts.forEach(p => {
        const productCardHTML = `
            <div class="product-item-wrapper no-info animate-fade-in" data-page-url="${p.pageUrl}" data-id="${p.id}">
                <div class="product-card" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-img-src="${p.imgSrc}" data-sizes="${p.sizes.join(',')}" data-page-url="${p.pageUrl}">
                    <div class="product-image-container">
                        <img src="${p.imgSrc}" alt="${p.name}" loading="lazy">
                        <div class="product-favorite-icon">
                            <i class="far fa-heart"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
        relatedProductsContainer.innerHTML += productCardHTML;
    });

    // Re-initialize favorite icons for the newly added related products
    relatedProductsContainer.querySelectorAll('.product-favorite-icon').forEach(icon => {
        const card = icon.closest('.product-card');
        // Find the full product data from the global allProducts array using the data-id
        const productId = card.dataset.id;
        const product = window.allProducts.find(p => p.id === productId);

        if (window.isFavorited && window.isFavorited(product)) {
            icon.innerHTML = '<i class="fas fa-heart"></i>';
        }
        // The main event listener on the body in mor.js will handle the click.
    });

    // --- Reviews Button ---
    const writeReviewBtn = document.getElementById('write-review-btn');
    if (writeReviewBtn) {
        writeReviewBtn.addEventListener('click', () => {
            if (window.isUserLoggedIn && window.isUserLoggedIn()) {
                window.location.href = `review.html?product=${productId}`;
            } else {
                window.openLoginRequiredModal && window.openLoginRequiredModal('You need to be logged in to write a review.');
            }
        });
    }
    // --- Final Step: Show the content ---
    document.querySelectorAll('.loading').forEach(el => {
        el.classList.remove('loading');
    });
});