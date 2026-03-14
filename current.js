// currentUser.js
import { auth } from "./src/auth.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Logout function
export const logoutUser = async () => {
    try {
        await signOut(auth);
        console.log("User logged out successfully");

        // After sign-out, onAuthStateChanged will trigger the data clearing.
        // We can also redirect here to be safe.
        window.location.href = 'index.html';
    } catch (err) {
        console.error("Logout error:", err.message);
    }
};

// Attach logout to a global click handler for dynamically changed buttons
document.addEventListener('click', e => {
    // This listener handles clicks on logout buttons that might be dynamically added to the page.
    const desktopLogout = e.target.closest('#desktop-login-link');
    const mobileLogout = e.target.closest('#mobile-login-link');

    if ((desktopLogout || mobileLogout) && localStorage.getItem('mor_user_loggedin') === 'true') {
        e.preventDefault();
        logoutUser();
    }
});

// Listen for authentication state changes to clear data on logout.
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // User has logged out, clear all sensitive local data.
    localStorage.clear();
    sessionStorage.clear();

    // Also clear the UI elements to reflect the empty state.
    document.querySelector('.favorites-items')?.innerHTML = '';
    document.querySelector('.cart-items')?.innerHTML = '';
  }
});
