// Import the functions you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHUtNHyQZhkyYZtx_sHLOrhRoiaD8sPsU",
  authDomain: "morbymansi.firebaseapp.com",
  projectId: "morbymansi",
  storageBucket: "morbymansi.firebasestorage.app",
  messagingSenderId: "643147233927",
  appId: "1:643147233927:web:728b88997e4ceb0c44d622",
  measurementId: "G-HWNLX4DHD6"
};
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const analytics = getAnalytics(firebaseApp);

let currentUser = null;
onAuthStateChanged(auth, (user) => {
    currentUser = user; // always contains current logged-in user
});

// Track login state
onAuthStateChanged(auth, async (user) => { // <-- make async
  // Update UI elements across the site
  const desktopLoginLink = document.getElementById('desktop-login-link');
  const mobileLoginLink = document.getElementById('mobile-login-link');

  if (user) {
    console.log("✅ Logged in as:", user.email);
    localStorage.setItem("mor_user_loggedin", "true");

    // Change Login buttons to Logout/Profile
    if (desktopLoginLink) {
      desktopLoginLink.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
      desktopLoginLink.setAttribute('aria-label', 'Logout');
      desktopLoginLink.href = '#'; // Prevent navigation
    }
    if (mobileLoginLink) {
      mobileLoginLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
      mobileLoginLink.href = '#';
    }

    // Load cart from Firestore and update local cart
    const firestoreCart = await loadCartFromFirestore();
    if (firestoreCart) {
      localStorage.setItem("mor_cart", JSON.stringify(firestoreCart));
      // Optionally, trigger UI update for cart here
    }
  } else {
    console.log("❌ No user logged in");
    localStorage.setItem("mor_user_loggedin", "false");

    // Revert buttons to Login
    if (desktopLoginLink) {
      desktopLoginLink.innerHTML = '<i class="fas fa-user"></i>';
      desktopLoginLink.setAttribute('aria-label', 'Login');
      desktopLoginLink.href = 'login.html';
    }
    if (mobileLoginLink) {
      mobileLoginLink.innerHTML = '<i class="fas fa-user"></i> Login';
      mobileLoginLink.href = 'login.html';
    }
    // Save current cart before clearing
    const prevCart = localStorage.getItem("mor_cart");
    if (prevCart) {
      localStorage.setItem("mor_cart_last", prevCart);
    }
    localStorage.removeItem("mor_cart"); // <-- clear cart on logout
  }
});

// Helper: Save cart to Firestore for current user
async function saveCartToFirestore(cart) {
  // Always get latest user
  const user = auth.currentUser;
  if (!user) return;
  try {
    await setDoc(doc(db, "carts", user.uid), { cart });
    console.log("🛒 Cart saved to Firestore");
  } catch (e) {
    console.error("Error saving cart:", e);
  }
}

// Helper: Load cart from Firestore for current user
async function loadCartFromFirestore() {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const docSnap = await getDoc(doc(db, "carts", user.uid));
    if (docSnap.exists()) {
      console.log("🛒 Cart loaded from Firestore");
      return docSnap.data().cart;
    }
  } catch (e) {
    console.error("Error loading cart:", e);
  }
  return null;
}

// Add new function for cart initialization
async function initializeUserCart(user) {
    if (!user) return;
    
    try {
        const docSnap = await getDoc(doc(db, "carts", user.uid));
        if (docSnap.exists()) {
            const firestoreCart = docSnap.data().items || {};
            localStorage.setItem("mor_cart", JSON.stringify(firestoreCart));
            console.log("🛒 Cart initialized from Firestore:", firestoreCart);
            return firestoreCart;
        } else {
            // No cart exists in Firestore, check localStorage
            const localCart = localStorage.getItem("mor_cart_last");
            if (localCart) {
                // Save previous cart to Firestore
                const cartData = JSON.parse(localCart);
                await setDoc(doc(db, "carts", user.uid), {
                    items: cartData,
                    updatedAt: new Date().toISOString()
                });
                localStorage.setItem("mor_cart", localCart);
                console.log("🛒 Previous cart restored:", cartData);
                return cartData;
            }
        }
    } catch (error) {
        console.error("Error initializing cart:", error);
    }
    return {};
}

// Modify the auth state listener
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    const desktopLoginLink = document.getElementById('desktop-login-link');
    const mobileLoginLink = document.getElementById('mobile-login-link');

    if (user) {
        console.log("✅ Logged in as:", user.email);
        localStorage.setItem("mor_user_loggedin", "true");

        // Initialize cart immediately after login
        await initializeUserCart(user);

        // Update UI
        if (desktopLoginLink) {
          desktopLoginLink.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
          desktopLoginLink.setAttribute('aria-label', 'Logout');
          desktopLoginLink.href = '#'; // Prevent navigation
        }
        if (mobileLoginLink) {
          mobileLoginLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
          mobileLoginLink.href = '#';
        }
      } else {
        console.log("❌ No user logged in");
        localStorage.setItem("mor_user_loggedin", "false");

        // Revert buttons to Login
        if (desktopLoginLink) {
          desktopLoginLink.innerHTML = '<i class="fas fa-user"></i>';
          desktopLoginLink.setAttribute('aria-label', 'Login');
          desktopLoginLink.href = 'login.html';
        }
        if (mobileLoginLink) {
          mobileLoginLink.innerHTML = '<i class="fas fa-user"></i> Login';
          mobileLoginLink.href = 'login.html';
        }
        // Save current cart before clearing
        const prevCart = localStorage.getItem("mor_cart");
        if (prevCart) {
          localStorage.setItem("mor_cart_last", prevCart);
        }
        localStorage.removeItem("mor_cart"); // <-- clear cart on logout
      }
});

// Update the export
export { auth, db, storage, currentUser, analytics, saveCartToFirestore, loadCartFromFirestore, initializeUserCart };