import { auth, db } from "./auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Helper function to get favorites from Firestore
async function getFavoritesFromFirestore(userId) {
    try {
        const docSnap = await getDoc(doc(db, "favorites", userId));
        return docSnap.exists() ? docSnap.data().items : [];
    } catch (error) {
        console.error("Error getting favorites from Firestore:", error);
        return [];
    }
}

export async function addToFavorites(productId, productData) {
    try {
        if (!auth.currentUser) return false;

        const userId = auth.currentUser.uid;
        const favorites = await getFavoritesFromFirestore(userId);

        // Check if the product is already in favorites
        const existingProduct = favorites.find(item => item.id === productId);
        if (existingProduct) {
            // Product already in favorites, no need to add again
            return false;
        }

        // Add product to favorites
        favorites.push({ ...productData, addedAt: new Date().toISOString() });

        await setDoc(doc(db, "favorites", userId), {
            items: favorites,
            updatedAt: new Date().toISOString()
        });

        // Also update localStorage
        localStorage.setItem("mor_favorites", JSON.stringify(favorites));

        return true;
    } catch (error) {
        console.error("Error adding to favorites:", error);
        return false;
    }
}

export async function removeFromFavorites(productId) {
    try {
        if (!auth.currentUser) return false;

        const userId = auth.currentUser.uid;
        const favorites = await getFavoritesFromFirestore(userId);

        // Filter out the item to be removed
        const updatedFavorites = favorites.filter(item => item.id !== productId);

        await setDoc(doc(db, "favorites", userId), {
            items: updatedFavorites,
            updatedAt: new Date().toISOString()
        });

        // Also update localStorage
        localStorage.setItem("mor_favorites", JSON.stringify(updatedFavorites));

        return true;
    } catch (error) {
        console.error("Error removing from favorites:", error);
        return false;
    }
}

export async function toggleFavoriteBackend(productId, productData) {
    try {
        if (!auth.currentUser) return false;

        const userId = auth.currentUser.uid;
        const favorites = await getFavoritesFromFirestore(userId);

        // Check if product exists in favorites
        const existingIndex = favorites.findIndex(item => item.id === productId);
        
        if (existingIndex !== -1) {
            // Remove from favorites
            favorites.splice(existingIndex, 1);
        } else {
            // Add to favorites
            // Ensure productData is not null and has an id before adding
            if (productData && productData.id) {
                favorites.push({ ...productData, addedAt: new Date().toISOString() });
            }
        }

        await setDoc(doc(db, "favorites", userId), {
            items: favorites,
            updatedAt: new Date().toISOString()
        });

        // Also update localStorage
        localStorage.setItem("mor_favorites", JSON.stringify(favorites));

        return existingIndex === -1; // Returns true if added, false if removed
    } catch (error) {
        console.error("Error toggling favorite:", error);
        return false;
    }
}
// Make it globally accessible for mor.js to call the backend logic
window.toggleFavoriteBackend = toggleFavoriteBackend;


export async function isFavorite(productId) {
    try {
        let favorites = [];
        
        if (auth.currentUser) {
            favorites = await getFavoritesFromFirestore(auth.currentUser.uid);
        } else {
            const localFavorites = localStorage.getItem("mor_favorites");
            if (localFavorites) {
                favorites = JSON.parse(localFavorites);
            }
        }

        return favorites.some(item => item.id === productId);
    } catch (error) {
        console.error("Error checking favorite:", error);
        return false;
    }
}

export async function clearFavorites() {
    try {
        if (!auth.currentUser) return false;

        const userId = auth.currentUser.uid;

        await setDoc(doc(db, "favorites", userId), {
            items: [],
            updatedAt: new Date().toISOString()
        });

        // Also clear localStorage
        localStorage.removeItem("mor_favorites");

        return true;
    } catch (error) {
        console.error("Error clearing favorites:", error);
        return false;
    }
}

export async function syncFavorites() {
    try {
        if (!auth.currentUser) return false;
        
        const localFavorites = localStorage.getItem("mor_favorites");
        const firestoreFavorites = await getFavoritesFromFirestore(auth.currentUser.uid);
        const userId = auth.currentUser.uid;
        
        if (localFavorites && localFavorites !== '[]') {
            // If local has items, merge with firestore and push up. Local is master.
            const localItems = JSON.parse(localFavorites);
            const firestoreItems = firestoreFavorites;
            const merged = [...localItems];
            firestoreItems.forEach(fsItem => {
                if (!merged.some(lItem => lItem.id === fsItem.id)) merged.push(fsItem);
            });
            await setDoc(doc(db, "favorites", userId), {
                items: merged,
                updatedAt: new Date().toISOString()
            });
        } else if (firestoreFavorites.length > 0) {
            // If local is empty but firestore has items, pull them down.
            localStorage.setItem("mor_favorites", JSON.stringify(firestoreFavorites));
        }
        
        return false;
    } catch (error) {
        console.error("Error syncing favorites:", error);
        return false;
    }
}

export async function loadFavorites(containerId = null) {
    try {
        let favorites = [];
        
        if (auth.currentUser) {
            favorites = await getFavoritesFromFirestore(auth.currentUser.uid);
        } else {
            const localFavorites = localStorage.getItem("mor_favorites");
            if (localFavorites) {
                favorites = JSON.parse(localFavorites);
            }
        }

        if (containerId) {
            displayFavorites(favorites, containerId);
        }
        
        return favorites;
    } catch (error) {
        console.error("Error loading favorites:", error);
        return [];
    }
}

function displayFavorites(favorites, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!favorites || favorites.length === 0) {
        container.innerHTML = "<p>No favorites yet</p>";
        return;
    }
    
    favorites.forEach(item => {
        const div = document.createElement("div");
        div.className = "favorite-item";
        div.innerHTML = `
            <span>${item.name}</span>
            <span>$${item.price}</span>
            <button onclick="removeFromFavorites('${item.id}')">Remove</button>
        `;
        container.appendChild(div);
    });
}

// Initialize favorites and auth listeners
auth.onAuthStateChanged(async (user) => {
    if (user) {
        await syncFavorites();
    }
});
