import { auth, db } from "./src/auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Helper function to get cart from Firestore
async function getCartFromFirestore(userId) {
    try {
        const docRef = doc(db, "carts", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Cart loaded from Firestore:", docSnap.data());
            return docSnap.data().items || {};
        }
        return {};
    } catch (error) {
        console.error("Error getting cart:", error);
        return {};
    }
}

// Add to cart function
export async function addToCart(productId, productData) {
    try {
        if (!auth.currentUser) {
            console.log("No user logged in");
            alert("Please login to add items to cart");
            return false;
        }

        const userId = auth.currentUser.uid;
        console.log("Adding to cart for user:", userId);

        // Get current cart
        const cart = await getCartFromFirestore(userId);
        
        // Update cart
        cart[productId] = {
            ...productData,
            qty: (cart[productId]?.qty || 0) + 1,
            lastUpdated: new Date().toISOString()
        };

        // Save to Firestore
        await setDoc(doc(db, "carts", userId), { 
            items: cart,
            updatedAt: new Date().toISOString()
        });

        // Update localStorage
        localStorage.setItem("mor_cart", JSON.stringify(cart));
        console.log("Cart updated successfully:", cart);
        
        return true;
    } catch (error) {
        console.error("Error in addToCart:", error);
        alert("Failed to add item to cart");
        return false;
    }
}

// Remove from cart function
export async function removeFromCart(productId) {
    try {
        if (!auth.currentUser) {
            console.log("No user logged in");
            return false;
        }

        const userId = auth.currentUser.uid;
        const cart = await getCartFromFirestore(userId);

        if (cart[productId]) {
            delete cart[productId];
            
            await setDoc(doc(db, "carts", userId), { 
                items: cart,
                updatedAt: new Date().toISOString()
            });

            localStorage.setItem("mor_cart", JSON.stringify(cart));
            console.log("Item removed from cart:", productId);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error in removeFromCart:", error);
        alert("Failed to remove item from cart");
        return false;
    }
}

// Update quantity of an item in cart
export async function updateCartItemQuantity(productId, quantity) {
    try {
        if (!auth.currentUser) {
            alert("Please login to modify cart");
            return false;
        }

        if (quantity <= 0) {
            return removeFromCart(productId);
        }

        const userId = auth.currentUser.uid;
        const cart = await getCartFromFirestore(userId);

        if (cart[productId]) {
            cart[productId].qty = quantity;
            cart[productId].lastUpdated = new Date().toISOString();
            
            await setDoc(doc(db, "carts", userId), {
                items: cart,
                updatedAt: new Date().toISOString()
            });

            localStorage.setItem("mor_cart", JSON.stringify(cart));
            console.log(`Updated quantity for item ${productId} to ${quantity}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        return false;
    }
}

// Clear entire cart
export async function clearCart() {
    try {
        if (!auth.currentUser) return false;

        const userId = auth.currentUser.uid;
        await setDoc(doc(db, "carts", userId), {
            items: {},
            updatedAt: new Date().toISOString()
        });

        localStorage.removeItem("mor_cart");
        console.log("Cart cleared successfully");
        return true;
    } catch (error) {
        console.error("Error clearing cart:", error);
        return false;
    }
}

// Get cart total
export async function getCartTotal() {
    try {
        if (!auth.currentUser) return 0;

        const cart = await getCartFromFirestore(auth.currentUser.uid);
        return Object.values(cart).reduce((total, item) => {
            return total + (item.price * item.qty);
        }, 0);
    } catch (error) {
        console.error("Error calculating cart total:", error);
        return 0;
    }
}

// Sync cart between localStorage and Firestore
export async function syncCart() {
    try {
        if (!auth.currentUser) return false;

        const localCart = localStorage.getItem("mor_cart");
        const userId = auth.currentUser.uid;

        if (localCart) {
            // Local cart exists, sync to Firestore
            const cart = JSON.parse(localCart);
            await setDoc(doc(db, "carts", userId), {
                items: cart,
                updatedAt: new Date().toISOString()
            });
        } else {
            // No local cart, fetch from Firestore
            const firestoreCart = await getCartFromFirestore(userId);
            localStorage.setItem("mor_cart", JSON.stringify(firestoreCart));
        }
        return true;
    } catch (error) {
        console.error("Error syncing cart:", error);
        return false;
    }
}

// Load cart items for current user
export async function loadCart() {
    if (!auth.currentUser) return [];
    const cartObj = await getCartFromFirestore(auth.currentUser.uid);
    return Object.values(cartObj); // convert object to array for rendering
}

