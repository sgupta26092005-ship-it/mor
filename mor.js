const initializeApp = () => {
    // --- Smooth scrolling for navigation links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- Promo Slider ---
    let currentSlide = 0;
    const slides = document.querySelectorAll('.promo-img');
    if (slides.length > 0) {
        const showSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
        };
        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        };
        slides[0].classList.add('active');
        setInterval(nextSlide, 2000);
    }

    // Info Banner Slider
    let currentInfoSlide = 0;
    const infoSlider = document.querySelector('.info-slider');
    const infoSlides = document.querySelectorAll('.info-slide');
    const infoDots = document.querySelectorAll('.info-dot');
    const infoSlideCount = infoSlides.length;

    function showInfoSlide(index) {
        if (infoSlider) {
            infoSlider.style.transform = `translateX(-${index * 100}%)`;
        }
        infoDots.forEach(dot => dot.classList.remove('active'));
        if (infoDots[index]) {
            infoDots[index].classList.add('active');
        }
    }

    function nextInfoSlide() {
        currentInfoSlide = (currentInfoSlide + 1) % infoSlideCount;
        showInfoSlide(currentInfoSlide);
    }

    if (infoSlideCount > 0) {
        showInfoSlide(0); // Initialize first slide
        setInterval(nextInfoSlide, 3000); // Change info slide every 3 seconds

        infoDots.forEach(dot => {
            dot.addEventListener('click', () => {
                showInfoSlide(parseInt(dot.dataset.slide));
            });
        });
    }

    // --- Login Page Navigation ---
    // This function will be called when a login is required.
    // It redirects to the login page, passing the current page as a parameter
    // so the user can be redirected back after a successful login.
    const openLoginModal = () => {
        // Get the current path, but remove the leading slash
        const redirectPath = (window.location.pathname + window.location.search).substring(1);
        window.location.href = `login.html?redirect=${encodeURIComponent(redirectPath)}`;
    };
    window.openLoginModal = openLoginModal;


    // Header background opacity on scroll
    const header = document.querySelector('.header');
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (header) {
                    if (window.scrollY > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // --- Mobile Navigation ---
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinksContainer = document.querySelector('.nav-links-container');
    const overlay = document.querySelector('.overlay');
    const closeMenuBtn = document.querySelector('.close-menu');
    
    // --- Cart Side Panel ---
    const cartPopup = document.getElementById('cart-popup');
    const openCartBtns = document.querySelectorAll('.cart-btn'); // Desktop cart buttons
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const continueShoppingBtn = document.querySelector('.continue-shopping-btn');

    const openCart = () => {
        if (cartPopup) cartPopup.classList.add('open');
        if (overlay) overlay.className = 'overlay right';
        handleOverlayAndScroll(true);
    };

    const handleOverlayAndScroll = (shouldOpen) => {
        // This function is now the single source of truth for the overlay and body scroll lock.
        if (shouldOpen) {
            overlay.style.display = 'block';
            setTimeout(() => overlay.classList.add('active'), 10); // Fade in
            document.body.classList.add('no-scroll');
        } else {
            // Only close the overlay if no other side panels are open.
            // We check this *after* the current panel has already started closing.
            const anyOtherPanelOpen = document.querySelector('.cart-popup.open, .favorites-popup.open, .nav-links-container.open');
            if (!anyOtherPanelOpen) {
                overlay.className = 'overlay'; // Reset overlay classes
                overlay.classList.remove('active');
                document.body.classList.remove('no-scroll');
                setTimeout(() => { overlay.style.display = 'none'; }, 400); // Match CSS transition
            }
        }
    };

    const toggleMenu = () => {
        if (!navLinksContainer) return;
        const header = document.querySelector('.header');
        const shouldOpen = !navLinksContainer.classList.contains('open');
        
        navLinksContainer.classList.toggle('open', shouldOpen);
        if (overlay) overlay.className = 'overlay left'; // Set overlay style for left panel
        handleOverlayAndScroll(shouldOpen);

        if (header) header.classList.toggle('menu-open', shouldOpen);
    };

    const closeSidePanels = () => {
        const header = document.querySelector('.header');
        let wasPanelOpen = false;
        if (favoritesPopup && favoritesPopup.classList.contains('open')) {
            favoritesPopup.classList.remove('open');
            wasPanelOpen = true;
        }
        if (cartPopup && cartPopup.classList.contains('open')) {
            cartPopup.classList.remove('open');
            wasPanelOpen = true;
        }
        if (navLinksContainer && navLinksContainer.classList.contains('open')) {
            navLinksContainer.classList.remove('open');
            if (header) {
                header.classList.remove('menu-open');
            }
            wasPanelOpen = true;
        }
        if (wasPanelOpen) handleOverlayAndScroll(false);
    };

    // --- Favorites Side Panel ---
    const favoritesPopup = document.getElementById('favorites-popup');
    const openFavoritesBtns = document.querySelectorAll('.favorites-btn, #mobile-favorites-link');
    const closeFavoritesBtn = document.querySelector('.close-favorites-btn');
    const clearFavoritesBtn = document.querySelector('.clear-favorites-btn');
    const startBrowsingBtn = document.querySelector('.start-browsing-btn');

    const openFavorites = () => {
        if (favoritesPopup) {
            favoritesPopup.classList.add('open');
            if (overlay) overlay.className = 'overlay left'; // Set overlay style for left panel
            handleOverlayAndScroll(true);
        }
    };

    // --- Event Listeners for Panels ---
    if (hamburger) hamburger.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);

    if (navLinksContainer) {
        // Use event delegation to handle clicks inside the nav container
        navLinksContainer.addEventListener('click', (e) => {
            const target = e.target.closest('a, button');
            if (!target) return;

            // Only close the panel if it's a navigation link, not a button that opens another panel.
            if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
                closeSidePanels();
            }
        });
    }
    
    openFavoritesBtns.forEach(btn => {
        btn.addEventListener('click', openFavorites);
    });
    if (closeFavoritesBtn) closeFavoritesBtn.addEventListener('click', closeSidePanels);
    if (clearFavoritesBtn) {
        clearFavoritesBtn.addEventListener('click', async () => {
            // Confirm before clearing
            if (confirm('Are you sure you want to clear all your favorites? This cannot be undone.')) {
                if (window.clearFavorites) {
                    const success = await window.clearFavorites();
                    if (success) {
                        reloadFavoritesFromStorage(); // Reload from now-empty storage
                        showToast('All favorites have been cleared.', 'fa-check-circle');
                        // Manually update any visible hearts on the page
                        document.querySelectorAll('.product-favorite-icon .fa-heart').forEach(icon => {
                            icon.className = 'far fa-heart';
                        });
                    }
                }
            }
        });
    }
    openCartBtns.forEach(btn => {
        // This listener now only applies to non-header cart buttons, like on product cards.
        btn.addEventListener('click', openCart);
    });
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeSidePanels);
    if (startBrowsingBtn) {
        startBrowsingBtn.addEventListener('click', () => {
            closeSidePanels();
            document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', closeSidePanels);
    // Add closing functionality to the overlay for all side panels
    if (overlay) overlay.addEventListener('click', closeSidePanels);

    // --- Toast Notification ---
    const toast = document.getElementById('notification-toast');
    let toastTimeout;

    const showToast = (message, iconClass = 'fa-check-circle') => {
        if (toast) {
            // Clear any existing timeouts to prevent the toast from hiding prematurely
            clearTimeout(toastTimeout);

            toast.style.display = 'flex'; // Ensure it's visible before animation
            toast.innerHTML = `<i class="fas ${iconClass}"></i> ${message}`;
            toast.classList.add('show');

            toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
                // After the slide-out animation (500ms), hide it completely
                setTimeout(() => { toast.style.display = 'none'; }, 500);
            }, 2000);
        }
    };
    // Make it globally accessible for product pages
    window.showToast = showToast;

    // --- Simple Auth Check (for demonstration) ---
    const isUserLoggedIn = () => {
        // This now reads the state set by the Firebase onAuthStateChanged listener
        // in src/index.js. It's no longer the source of truth, just a convenient
        // synchronous check for UI purposes.
        return localStorage.getItem('mor_user_loggedin') === 'true';
    };
    window.isUserLoggedIn = isUserLoggedIn;

    // --- Login Required Modal ---
    const loginRequiredModal = document.getElementById('login-required-modal');
    if (loginRequiredModal) {
        const closeLoginRequiredBtn = loginRequiredModal.querySelector('.login-required-modal-close');
        const loginNowBtn = document.getElementById('login-now-btn');
        const modalMessage = loginRequiredModal.querySelector('p');

        const openLoginRequiredModal = (message) => {
            if (message) {
                modalMessage.innerHTML = message;
            }

            loginRequiredModal.style.display = 'flex';
            setTimeout(() => loginRequiredModal.classList.add('show'), 10);
        };
        window.openLoginRequiredModal = openLoginRequiredModal;

        const closeLoginRequiredModal = () => {
            loginRequiredModal.classList.remove('show');
            // Reset to default message after closing
            setTimeout(() => { modalMessage.innerHTML = 'You need to be logged in to use this feature.'; }, 300);
            setTimeout(() => loginRequiredModal.style.display = 'none', 300);
        };

        closeLoginRequiredBtn.addEventListener('click', closeLoginRequiredModal);
        loginRequiredModal.addEventListener('click', (e) => {
            if (e.target === loginRequiredModal) closeLoginRequiredModal();
        });
        loginNowBtn.addEventListener('click', window.openLoginModal);
    }

    // --- Favorites Functionality ---
    let favoriteItems = JSON.parse(localStorage.getItem('mor_favorites')) || [];
    const favoritesItemsContainer = document.querySelector('.favorites-items');
    const favoritesEmptyMsg = document.querySelector('.favorites-empty');

    // New function to reload favorites from localStorage and update UI
    const reloadFavoritesFromStorage = () => {
        favoriteItems = JSON.parse(localStorage.getItem('mor_favorites')) || [];
        updateFavoritesUI();
    };

    const saveFavorites = () => {
        localStorage.setItem('mor_favorites', JSON.stringify(favoriteItems));
        updateFavoritesUI();
    };

    const updateFavoritesUI = () => {
        // Update UI based on whether there are favorite items
        const favoritesPageGrid = document.getElementById('favorites-grid');

        // Handle the side panel
        if (favoritesItemsContainer && favoritesEmptyMsg) {
            if (favoriteItems.length === 0) {
                favoritesItemsContainer.style.display = 'none';
                favoritesEmptyMsg.style.display = 'block';
            } else {
                favoritesItemsContainer.style.display = 'block';
                favoritesEmptyMsg.style.display = 'none';
                favoritesItemsContainer.innerHTML = ''; // Clear old items

                favoriteItems.forEach(item => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'favorite-item'; // Use a different class to avoid style conflicts
                    itemEl.innerHTML = `
                        <img src="${item.imgSrc}" alt="${item.name}" class="favorite-item-img">
                        <div class="favorite-item-details">
                            <div class="favorite-item-name">${item.name}</div>
                            <div class="favorite-item-price">${item.price}</div>
                            <button class="favorite-item-move-to-cart" data-id="${item.id}" data-name="${item.name}">Move to Cart</button>
                        </div>
                        <button class="favorite-item-remove" data-id="${item.id}" data-name="${item.name}">&times;</button>
                    `;
                    favoritesItemsContainer.appendChild(itemEl);
                });
            }
        }

        // Handle the dedicated favorites page grid
        if (favoritesPageGrid) {
            favoritesPageGrid.innerHTML = ''; // Clear old items
            if (favoriteItems.length === 0) {
                favoritesPageGrid.innerHTML = `
                    <div class="favorites-empty-page">
                        <i class="far fa-heart"></i>
                        <p>You haven't saved any favorites yet.</p>
                        <a href="shop.html" class="cta-btn">Start Browsing</a>
                    </div>
                `;
            } else {
                favoriteItems.forEach(product => {
                    const productCardHTML = `
                        <div class="product-item-wrapper no-info" data-page-url="${product.pageUrl || `product.html?id=${product.id}`}" style="cursor: pointer;">
                            <div class="product-card" data-name="${product.name}" data-price="${product.price}" data-img-src="${product.imgSrc}" data-page-url="${product.pageUrl || `product.html?id=${product.id}`}" data-id="${product.id}" data-sizes="${product.sizes || 'M'}">
                                <div class="product-image-container"><img src="${product.imgSrc.startsWith('photos/') ? product.imgSrc : 'photos/' + product.imgSrc}" alt="${product.name}" loading="lazy">
                                    <div class="product-favorite-icon"><i class="fas fa-heart"></i></div>
                                </div>
                            </div>
                        </div>
                    `;
                    favoritesPageGrid.innerHTML += productCardHTML;
                });
            }
        }
    };

    const toggleFavorite = async (product, icon) => {
        if (!isUserLoggedIn()) {
            window.openLoginRequiredModal('You need to be logged in to save favorites.');
            return;
        }
    
        // Use the new Firebase-backed toggleFavorite function
        // Ensure you have `id` in the product object for this to work.
        const productId = product.id;
        if (!productId) {
            console.error("Product ID is missing. Cannot toggle favorite.", product);
            window.showToast('Could not update favorites.', 'fa-exclamation-triangle');
            return;
        }
    
        // The toggleFavorite from fav.js returns `true` if added, `false` if removed.
        const wasAdded = await window.toggleFavoriteBackend(productId, product);
    
        if (wasAdded) {
            icon.innerHTML = '<i class="fas fa-heart"></i>'; // Change to solid heart
        } else {
            icon.innerHTML = '<i class="far fa-heart"></i>'; // Change to empty heart
        }
        // After fav.js updates localStorage, we need to reload the local array and update UI.
        reloadFavoritesFromStorage();
    };
    window.toggleFavorite = toggleFavorite; // Make it globally accessible for product-loader.js

    const isFavorited = (product) => {
        // Use product.id for a more reliable check
        return favoriteItems.some(item => item.id === product.id);
    };
    window.isFavorited = isFavorited;

    // Event delegation for favorite item removal and move to cart
    favoritesItemsContainer.addEventListener('click', async (e) => { // Made async to await backend calls
        const target = e.target;
        const productId = target.dataset.id; // Get ID from the button
        const productName = target.dataset.name; // Get name for toast message

        if (target.classList.contains('favorite-item-remove')) {
            if (!productId) {
                console.error("Product ID missing for favorite item removal.", target);
                return;
            }

            // Call the backend toggle function to remove it.
            // The second argument is empty because productData is only needed when adding.
            await window.toggleFavoriteBackend(productId, {});

            // After backend update, reload local state and UI
            reloadFavoritesFromStorage();
            
            // Also update the heart icon on the main page if it exists
            const productCardIcon = document.querySelector(`.product-card[data-id="${productId}"] .product-favorite-icon`);
            if (productCardIcon) productCardIcon.innerHTML = '<i class="far fa-heart"></i>';
            
            window.showToast(`${productName} removed from favorites.`, 'fa-check-circle');
        }

        if (target.classList.contains('favorite-item-move-to-cart')) {
            if (!productId) {
                console.error("Product ID missing for favorite item move to cart.", target);
                return;
            }

            const itemToMove = favoriteItems.find(item => item.id === productId); // Find by ID
            if (itemToMove) {
                if (!isUserLoggedIn()) {
                    openLoginRequiredModal('You must be logged in to move items to your cart.');
                    return;
                }

                const productForCart = {
                    ...itemToMove,
                    size: 'M', // Default to 'M' when moving from favorites
                    quantity: 1
                };
                addToCart(productForCart);
                // The page reloads on addToCart, so subsequent actions might not be seen.

                // Remove from favorites after moving by calling the backend function
                await window.toggleFavorite(productId, {});

                // Also update the icon on the page if it exists
                const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
                if (productCard && productCard.querySelector('.product-favorite-icon')) {
                    productCard.querySelector('.product-favorite-icon').innerHTML = '<i class="far fa-heart"></i>';
                }
            }
        }
    });

    // --- Cart functionality ---
    let cartItems = JSON.parse(localStorage.getItem('mor_cart')) || [];

    const cartItemsContainer = document.querySelector('.cart-items');
    const cartEmptyMsg = document.querySelector('.cart-empty');
    const subtotalAmountEl = document.getElementById('cart-subtotal-amount');
    const cartFooter = document.querySelector('.cart-footer');
    const saveCart = () => {
        localStorage.setItem('mor_cart', JSON.stringify(cartItems));
        updateCartUI();
    };
    window.saveCart = saveCart; // Make it global
    
    const updateCartUI = () => {
        const cartCountEl = document.querySelector('.cart-count');
        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        if (cartCountEl) {
            cartCountEl.textContent = totalQuantity;
            cartCountEl.style.display = totalQuantity > 0 ? 'flex' : 'none';
        }

        // If we are on the cart page, render the full cart view
        if (document.body.querySelector('.cart-page-main')) {
            renderFullCartPage();
        } else {
            // Otherwise, update the side-panel cart
            renderSidePanelCart();
        }
    };

    const renderSidePanelCart = () => {
        if (!cartItemsContainer || !cartEmptyMsg || !cartFooter) return;

        if (cartItems.length === 0) {
            cartItemsContainer.style.display = 'none';
            cartEmptyMsg.style.display = 'block';
            cartFooter.style.display = 'none';
        } else {
            cartItemsContainer.style.display = 'block';
            cartEmptyMsg.style.display = 'none';
            cartFooter.style.display = 'block';

            cartItemsContainer.innerHTML = ''; // Clear old items
            let subtotal = 0;

            cartItems.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';

                // Create size dropdown
                const availableSizes = item.sizes ? item.sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L', 'XL'];
                const sizeOptions = availableSizes.map(s => 
                    `<option value="${s}" ${s === item.size ? 'selected' : ''}>${s}</option>`
                ).join('');
                const sizeSelectorId = `cart-item-size-selector-${index}`;
                const sizeSelectorHTML = `
                    <select id="${sizeSelectorId}" class="cart-item-size-selector" data-item-index="${index}">${sizeOptions}</select>
                `;
                itemEl.innerHTML = `
                    <a href="${item.pageUrl}" class="cart-item-img-link">
                        <img src="${item.imgSrc}" alt="${item.name}" class="cart-item-img">
                    </a>
                    <div class="cart-item-details">
                        <a href="${item.pageUrl}" class="cart-item-name-link"><div class="cart-item-name">${item.name}</div></a>
                        <div class="cart-item-price">${item.price}</div>
                        <div class="cart-item-size">Size: ${sizeSelectorHTML}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn-small" data-name="${item.name}" data-size="${item.size}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn-small" data-name="${item.name}" data-size="${item.size}" data-action="increase">+</button>
                    </div>
                    <button class="cart-item-remove" data-name="${item.name}" data-size="${item.size}">&times;</button>
                `;
                cartItemsContainer.appendChild(itemEl);
                const priceValue = parseFloat(item.price.replace('₹', '').replace(',', ''));
                subtotal += priceValue * item.quantity;
            });

            subtotalAmountEl.textContent = `₹${subtotal.toFixed(2)}`;

            // Add event listeners for the new size selectors
            document.querySelectorAll('.cart-item-size-selector').forEach(selector => {
                selector.addEventListener('change', (e) => {
                    const newSize = e.target.value;
                    const itemIndex = parseInt(e.target.dataset.itemIndex, 10);
                    const itemToUpdate = cartItems[itemIndex];

                    // Check if an item with the new size already exists
                    const existingItem = cartItems.find((item, index) => 
                        item.name === itemToUpdate.name && item.size === newSize && index !== itemIndex
                    );

                    if (existingItem) {
                        showToast('This size is already in your cart.', 'fa-exclamation-circle');
                        e.target.value = itemToUpdate.size; // Revert selector
                    } else {
                        itemToUpdate.size = newSize;
                        saveCart();
                    }
                });
            });
        }
    };

    const renderFullCartPage = () => {
        const itemsListContainer = document.querySelector('.cart-items-list .cart-items');
        const emptyCartView = document.querySelector('.cart-items-list .cart-empty');
        const orderSummary = document.querySelector('.order-summary');

        if (!itemsListContainer || !emptyCartView || !orderSummary) return;

        if (cartItems.length === 0) {
            itemsListContainer.style.display = 'none';
            emptyCartView.style.display = 'block';
            orderSummary.style.display = 'none';
        } else {
            itemsListContainer.style.display = 'block';
            emptyCartView.style.display = 'none';
            orderSummary.style.display = 'block';

            itemsListContainer.innerHTML = ''; // Clear old items

            let subtotal = 0;

            cartItems.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                // Using the same layout as the old side panel for consistency
                const imagePath = item.imgSrc.startsWith('photos/') ? item.imgSrc : `photos/${item.imgSrc}`;
                itemEl.innerHTML = `
                    <a href="${item.pageUrl}" class="cart-item-img-link">
                        <img src="${imagePath}" alt="${item.name}" class="cart-item-img">
                    </a>
                    <div class="cart-item-details">
                        <a href="${item.pageUrl}" class="cart-item-name-link"><div class="cart-item-name">${item.name}</div></a>
                        <div class="cart-item-price">${item.price}</div>
                        <div class="cart-item-size">Size: ${item.size}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn-small" data-name="${item.name}" data-size="${item.size}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn-small" data-name="${item.name}" data-size="${item.size}" data-action="increase">+</button>
                    </div>
                    <button class="cart-item-remove" data-name="${item.name}" data-size="${item.size}">&times;</button>
                `;
                itemsListContainer.appendChild(itemEl);
                const priceValue = parseFloat(item.price.replace('₹', '').replace(',', ''));
                subtotal += priceValue * item.quantity;
            });

            // Update Order Summary
            document.getElementById('summary-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
            document.getElementById('summary-total').textContent = `₹${subtotal.toFixed(2)}`;
        }
    };

    const addToCart = (product) => {
        // Ensure imgSrc is just the filename, not the full path
        if (product.imgSrc && product.imgSrc.includes('/')) {
            product.imgSrc = product.imgSrc.split('/').pop();
        }

        // Ensure the product in cart has the 'sizes' property.
        if (!product.sizes) {
            product.sizes = 'S, M, L, XL'; // Default sizes if not provided
        }

        const existingItem = cartItems.find(item => item.name === product.name && item.size === product.size);

        if (existingItem) {
            existingItem.quantity += product.quantity;
        } else {
            cartItems.push(product);
        }
        saveCart();

        // Reload the page to reflect the cart changes
        window.location.reload();
    };
    window.addToCart = addToCart; // Make it global

    // --- Fly-to-Cart Animation ---
    const flyToCart = (startElement, product) => {
        // Gate the feature behind login
        if (!isUserLoggedIn()) {
            window.openLoginRequiredModal('Login to add an item to cart.');
            return;
        }

        const cartIcon = document.querySelector('.cart-btn i');
        if (!cartIcon) return;

        // Create the visual element for the animation
        const flyingImg = document.createElement('img');
        flyingImg.src = product.imgSrc;
        flyingImg.className = 'fly-to-cart-img';
        document.body.appendChild(flyingImg);

        // Get start and end positions for the animation
        const startRect = startElement.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        // Set initial position using transform
        const startX = startRect.left + startRect.width / 2;
        const startY = startRect.top + startRect.height / 2;
        flyingImg.style.transform = `translate(${startX}px, ${startY}px)`;

        // Animate to the cart icon
        setTimeout(() => {
            const endX = cartRect.left + cartRect.width / 2;
            const endY = cartRect.top + cartRect.height / 2;
            flyingImg.style.transform = `translate(${endX}px, ${endY}px) scale(0.1)`;
            flyingImg.style.opacity = '0';
        }, 10);

        // After animation, show feedback and clean up
        setTimeout(() => {
            // Add to cart data structure after the animation starts, so UI updates don't feel slow.
            addToCart(product);

            flyingImg.remove();
            showToast(`${product.name} has been added to your cart!`, 'fa-check-circle');
            // Maybe briefly animate the cart icon
            const cartBtn = document.querySelector('.cart-btn');
            cartBtn.style.transform = 'scale(1.2)';
            setTimeout(() => { cartBtn.style.transform = 'scale(1)'; }, 200);
        }, 1000); // This duration should match the CSS transition duration
    };
    window.flyToCart = flyToCart;

    // Event delegation for cart item actions.
    // We attach it to a common parent that exists on the page.
    const cartInteractionHandler = (e) => {
        const target = e.target;
        let cartNeedsUpdate = false;

        if (target.closest('.cart-item-remove')) {
            const itemElement = target.closest('.cart-item');
            const name = itemElement.querySelector('.cart-item-remove').dataset.name;
            const size = itemElement.querySelector('.cart-item-remove').dataset.size;
            cartItems = cartItems.filter(item => !(item.name === name && item.size === size));
            cartNeedsUpdate = true;
        } else if (target.closest('.quantity-btn-small')) {
            const button = target.closest('.quantity-btn-small');
            const name = button.dataset.name;
            const size = button.dataset.size;
            const itemToUpdate = cartItems.find(item => item.name === name && item.size === size);
            if (itemToUpdate) {
                if (button.dataset.action === 'increase') {
                    itemToUpdate.quantity++;
                } else if (itemToUpdate.quantity > 1) {
                    itemToUpdate.quantity--;
                } else { // quantity is 1 and decrease is clicked
                    cartItems = cartItems.filter(item => !(item.name === name && item.size === size));
                }
                cartNeedsUpdate = true;
            }
        } else if (target.matches('.cart-item-size-selector')) {
            const selector = target;
            const newSize = selector.value;
            const itemIndex = parseInt(selector.dataset.itemIndex, 10);
            const itemToUpdate = cartItems[itemIndex];

            // Check if an item with the same name and new size already exists
            const existingItem = cartItems.find((item, index) =>
                item.name === itemToUpdate.name && item.size === newSize && index !== itemIndex
            );

            if (existingItem) {
                // If it exists, merge them
                existingItem.quantity += itemToUpdate.quantity;
                // Remove the old item
                cartItems.splice(itemIndex, 1);
                showToast(`Merged with existing item in cart.`, 'fa-info-circle');
            } else {
                // Otherwise, just update the size
                itemToUpdate.size = newSize;
            }
            cartNeedsUpdate = true;
        } else if (target.closest('.quantity-btn-small')) {
            const button = target.closest('.quantity-btn-small');
            const name = button.dataset.name;
            const size = button.dataset.size;
            const itemToUpdate = cartItems.find(item => item.name === name && item.size === size);
            if (itemToUpdate) {
                if (button.dataset.action === 'increase') {
                    itemToUpdate.quantity++;
                } else if (itemToUpdate.quantity > 1) {
                    itemToUpdate.quantity--;
                } else { // quantity is 1 and decrease is clicked
                    cartItems = cartItems.filter(item => !(item.name === name && item.size === size));
                }
                cartNeedsUpdate = true;
            }
        }
        if (cartNeedsUpdate) {
            saveCart();
        }
    };

    // Attach the handler to the specific cart containers if they exist
    const cartPageContainer = document.querySelector('.cart-page-main');
    const cartPopupContainer = document.getElementById('cart-popup');

    if (cartPageContainer) {
        cartPageContainer.addEventListener('click', cartInteractionHandler);
    }
    if (cartPopupContainer) {
        cartPopupContainer.addEventListener('click', cartInteractionHandler);
    }

    document.querySelectorAll('.product-favorite-icon').forEach(icon => {
        icon.addEventListener('click', function(event) {
            event.stopPropagation();
            const card = this.closest('.product-card');
            
            // Determine product ID reliably
            const productId = card.dataset.id || (card.dataset.pageUrl ? card.dataset.pageUrl.split('id=')[1] : null);
            if (!productId) {
                console.error("Product ID could not be determined for favorite action.", card);
                window.showToast('Could not update favorites: Product ID missing.', 'fa-exclamation-triangle');
                return;
            }

            // Ensure imgSrc is a relative path, preferring data-img-src
            let imgSrc = card.dataset.imgSrc;
            if (!imgSrc) { // Fallback if data-img-src is not set
                imgSrc = card.querySelector('img')?.getAttribute('src');
                // If it's a full URL, try to extract the relative part starting from 'photos/' or just the filename
                if (imgSrc && imgSrc.includes('/')) {
                    const parts = imgSrc.split('/');
                    imgSrc = parts.slice(parts.indexOf('photos') > -1 ? parts.indexOf('photos') : parts.length - 1).join('/');
                }
            }

            const product = {
                id: productId,
                name: card.dataset.name,
                price: card.dataset.price,
                imgSrc: imgSrc,
                pageUrl: card.dataset.pageUrl // Include pageUrl for consistency
            };
            toggleFavorite(product, this);
        });
    });

    // --- Product Card Click to Navigate ---
    // Use event delegation on the body for any product card click
    document.body.addEventListener('click', (e) => { 
        // Find the closest wrapper, which should handle navigation
        const wrapper = e.target.closest('.product-item-wrapper');
        if (!wrapper) return; // Click was not on or inside a product item

        const card = wrapper.querySelector('.product-card'); 
        if (!card) return;

        // Prevent navigation if an interactive icon inside the card was clicked
        const favoriteIcon = e.target.closest('.product-favorite-icon');
        // Make selector more specific to only target cart icons inside product cards
        const cartIcon = e.target.closest('.product-card .product-cart-icon');

        if (favoriteIcon) { // Handle favorite click
            // This logic is for product cards on grid pages.
            // The product page has its own listener in product-loader.js.
            // We check if the icon has the 'page-favorite-icon' ID to avoid conflict.
            if (favoriteIcon.id === 'page-favorite-icon') {
                return; // Let the product-loader.js handle this.
            }

            const product = { id: card.dataset.id, name: card.dataset.name, price: card.dataset.price, imgSrc: card.dataset.imgSrc, pageUrl: card.dataset.pageUrl };
            toggleFavorite(product, favoriteIcon);
            return;
        }
        const productPage = card.dataset.pageUrl;
        if (productPage) {
             window.location.href = productPage;
        }
    });

    // --- CTA button handlers ---
    document.querySelectorAll('.cta-btn').forEach(btn => {
        // Exclude the new hero button which is now a link
        if (btn.id !== 'hero-shop-now') {
            btn.addEventListener('click', () => {
                const categoriesSection = document.getElementById('categories');
                if (categoriesSection) {
                    categoriesSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        );
        }
    });

    // Initial UI updates on page load
    updateCartUI();
    updateFavoritesUI();

    // Remove loading class after initial UI updates to prevent content flash
    if (document.body.classList.contains('loading')) {
        document.body.classList.remove('loading');
    }
};

initializeApp();