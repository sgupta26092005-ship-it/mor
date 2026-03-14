import { auth, db } from "./auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Helper function to get cart from Firestore
async function getCartFromFirestore(userId) {
    try {
        const docSnap = await getDoc(doc(db, "carts", userId));
        return docSnap.exists() ? docSnap.data().items : [];
    } catch (error) {
        console.error("Error getting cart from Firestore:", error);
        return [];
    }
}

export async function addToCart(productId, productData) {
    try {
        if (!auth.currentUser) return false;

        const userId = auth.currentUser.uid;
        const cart = await getCartFromFirestore(userId);

        // Check if the product is already in the cart
        const existingProduct = cart.find(item => item.id === productId);
        if (existingProduct) {
            // If the product exists, just update the quantity
            existingProduct.qty += 1;
        } else {
            // If the product doesn't exist, add it to the cart
            cart.push({ ...productData, qty: 1 });
        }

        await setDoc(doc(db, "carts", userId), {
            items: cart,
            updatedAt: new Date().toISOString()
        });

        // Also update localStorage
        localStorage.setItem("mor_cart", JSON.stringify(cart));

        return true;
    } catch (error) {
        console.error("Error adding to cart:", error);
        return false;
    }
}

export async function removeFromCart(productId) {
    try {
        if (!auth.currentUser) return false;

        const userId = auth.currentUser.uid;
        const cart = await getCartFromFirestore(userId);

        // Filter out the item to be removed
        const updatedCart = cart.filter(item => item.id !== productId);

        await setDoc(doc(db, "carts", userId), {
            items: updatedCart,
            updatedAt: new Date().toISOString()
        });

        // Also update localStorage
        localStorage.setItem("mor_cart", JSON.stringify(updatedCart));

        return true;
    } catch (error) {
        console.error("Error removing from cart:", error);
        return false;
    }
}

export async function updateCartItemQuantity(productId, quantity) {
    try {
        if (!auth.currentUser) return false;

        const userId = auth.currentUser.uid;
        const cart = await getCartFromFirestore(userId);

        // Find the item and update its quantity
        const itemToUpdate = cart.find(item => item.id === productId);
        if (itemToUpdate) {
            itemToUpdate.qty = quantity;
        }

        await setDoc(doc(db, "carts", userId), {
            items: cart,
            updatedAt: new Date().toISOString()
        });

        // Also update localStorage
        localStorage.setItem("mor_cart", JSON.stringify(cart));

        return true;
    } catch (error) {
        console.error("Error updating cart item quantity:", error);
        return false;
    }
}

export async function clearCart() {
    try {
        if (!auth.currentUser) return false;

        const userId = auth.currentUser.uid;

        await setDoc(doc(db, "carts", userId), {
            items: [],
            updatedAt: new Date().toISOString()
        });

        // Also clear localStorage
        localStorage.removeItem("mor_cart");

        return true;
    } catch (error) {
        console.error("Error clearing cart:", error);
        return false;
    }
}

export async function syncCart() {
    try {
        if (!auth.currentUser) return false;
        
        const localCart = localStorage.getItem("mor_cart");
        const userId = auth.currentUser.uid;
        
        if (localCart) {
            const cart = JSON.parse(localCart);
            await setDoc(doc(db, "carts", userId), {
                items: cart,
                updatedAt: new Date().toISOString()
            });
            return true;
        }
        
        const firestoreCart = await getCartFromFirestore(userId);
        if (firestoreCart) {
            localStorage.setItem("mor_cart", JSON.stringify(firestoreCart));
            return true;
        }
        
        return false;
    } catch (error) {
        console.error("Error syncing cart:", error);
        return false;
    }
}

export async function loadCart(containerId = null) {
    try {
        let cart = [];
        if (auth.currentUser) {
            const cartObj = await getCartFromFirestore(auth.currentUser.uid);
            cart = Object.values(cartObj);
        } else {
            const localCart = localStorage.getItem("mor_cart");
            if (localCart) {
                cart = Object.values(JSON.parse(localCart));
            }
        }

        if (containerId) {
            displayCart(cart, containerId);
        }
        return cart;
    } catch (error) {
        console.error("Error loading cart:", error);
        return [];
    }
}

function displayCart(cart, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = "";
    if (!cart || cart.length === 0) {
        container.innerHTML = "<p>Your cart is empty</p>";
        return;
    }
    
    cart.forEach(item => {
        // Implement your cart item UI here
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <span>${item.name}</span>
            <span>Qty: ${item.qty}</span>
            <span>$${item.price}</span>
            <button onclick="removeFromCart('${item.id}')">Remove</button>
        `;
        container.appendChild(div);
    });
}

// Initialize cart and auth listeners
auth.onAuthStateChanged(async (user) => {
    if (user) {
        await syncCart();
    }
});