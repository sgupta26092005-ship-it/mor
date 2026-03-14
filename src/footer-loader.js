function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) {
        console.error('Footer placeholder not found!');
        return;
    }

    fetch('footer.html') // Fetch the content from the new footer.html file
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            footerPlaceholder.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading footer:', error);
            // Optionally, you could provide a fallback hardcoded footer here
            // or just leave the placeholder empty if the fetch fails.
        });
}

document.addEventListener('DOMContentLoaded', loadFooter);