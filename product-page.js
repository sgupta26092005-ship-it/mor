document.addEventListener('DOMContentLoaded', () => {
    // --- Gallery ---
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail-img');

    if (mainImage && thumbnails.length > 0) {
        const showImage = (thumb) => {
            mainImage.src = thumb.dataset.src;
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        };

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                showImage(thumb);
            });
        });
    }

    // --- Click-to-Zoom Image Modal ---
    const zoomModal = document.getElementById('zoom-modal');
    const zoomIcon = document.getElementById('zoom-icon');
    const zoomedImage = document.getElementById('zoomed-image');
    const closeModal = document.getElementById('zoom-modal-close');

    if (zoomModal && zoomIcon && zoomedImage && closeModal) {
        zoomIcon.addEventListener('click', () => {
            if (mainImage) {
                zoomedImage.src = mainImage.src;
                zoomModal.classList.add('show');
            }
        });

        const closeZoomModal = () => {
            zoomModal.classList.remove('show');
        }

        closeModal.addEventListener('click', closeZoomModal);
        zoomModal.addEventListener('click', (e) => {
            if (e.target === zoomModal) { // Close if clicking on the background
                closeZoomModal();
            }
        });
    }

    // --- Size Selector ---
    const sizeSelector = document.getElementById('size-selector');
    if (sizeSelector) {
        sizeSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('size-btn')) {
                sizeSelector.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    }

    // --- Quantity Counter ---
    const quantityValue = document.querySelector('.quantity-value');
    const quantityBtns = document.querySelectorAll('.quantity-btn');
    if (quantityValue && quantityBtns.length > 0) {
        quantityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                let currentQty = parseInt(quantityValue.textContent);
                if (btn.dataset.action === 'increase') {
                    currentQty++;
                } else if (currentQty > 1) {
                    currentQty--;
                }
                quantityValue.textContent = currentQty;
            });
        });
    }

    // --- Add to Cart ---
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const productName = document.getElementById('product-name')?.textContent;
            const productPrice = document.getElementById('product-price')?.textContent;
            const activeSizeBtn = sizeSelector?.querySelector('.size-btn.active');
            const productContainer = document.querySelector('.product-page-container');

            if (!productName || !productPrice || !activeSizeBtn || !productContainer || !quantityValue) return;

            // Get image source from product container's data attribute for consistency
            const imgSrc = productContainer.dataset.imgSrc;

            const product = {
                name: productName,
                price: productPrice,
                size: activeSizeBtn.textContent,
                imgSrc: imgSrc,
                quantity: parseInt(quantityValue.textContent)
            };
            
            // Use flyToCart instead of addToCart for animation
            window.flyToCart(addToCartBtn, product);
            // No need for showToast since flyToCart includes it
        });
    }

    // --- Write a Review Button ---
    const writeReviewBtn = document.getElementById('write-review-btn');
    const reviewsSection = document.querySelector('.reviews-section');
    if (writeReviewBtn && reviewsSection) {
        writeReviewBtn.addEventListener('click', () => {
            reviewsSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- Related Products ---
    const relatedProductsContainer = document.getElementById('related-products-container');
    const currentProductName = document.getElementById('product-name')?.textContent;

    if (relatedProductsContainer && currentProductName && typeof allProducts !== 'undefined') {
        const relatedProducts = allProducts
            .filter(p => p.name !== currentProductName)
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        relatedProductsContainer.innerHTML = relatedProducts.map(product => `
            <div class="product-item-wrapper">
                <a href="${product.pageUrl}" style="text-decoration: none; color: inherit;">
                    <div class="product-card" data-name="${product.name}" data-price="${product.price}" data-img-src="${product.imgSrc}" data-page-url="${product.pageUrl}">
                        <div class="product-image-container"><img src="${product.imgSrc}" alt="${product.name}"><div class="product-favorite-icon"><i class="far fa-heart"></i></div></div>
                    </div><div class="product-info"><h4 class="product-name">${product.name}</h4><p class="product-price">${product.price}</p></div></a></div>`).join('');
    }
});