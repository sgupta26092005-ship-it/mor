const offerBanner = document.getElementById('scrolling-offer-banner');
const closeBtn = document.getElementById('close-offer-btn');
const mainContent = document.querySelector('main');

if (offerBanner && closeBtn && mainContent) {
    closeBtn.addEventListener('click', () => {
        // Add a class to slide the banner up and out of view
        offerBanner.classList.add('hidden');

        // Adjust the main content's top margin to fill the space
        // This assumes the main content's margin was set to accommodate the banner
        const currentMarginTop = parseInt(window.getComputedStyle(mainContent).marginTop, 10);
        const bannerHeight = offerBanner.offsetHeight;
        mainContent.style.marginTop = `${currentMarginTop - bannerHeight}px`;
    });
}