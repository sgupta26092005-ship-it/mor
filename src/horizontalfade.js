document.addEventListener('DOMContentLoaded', () => {
    // This is now the main observer for all scroll-triggered animations.
    const elementsToAnimate = document.querySelectorAll('.featured-scroll .product-item-wrapper, .categories-scroll .category-card, [class*="animate-"]');

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Use 'active' class for consistency with CSS
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing once it's visible
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, {
        root: null,
        rootMargin: '0px 0px -50px 0px', // Start animating a little before it's fully in view
        threshold: 0.1
    });

    elementsToAnimate.forEach((el, index) => {
        // Apply a staggered delay only to items in a scroll container
        if (el.closest('.featured-scroll, .categories-scroll')) {
            el.style.transitionDelay = `${index * 20}ms`;
        }
        observer.observe(el);
    });
});