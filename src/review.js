import { auth, db } from "./auth.js";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Add a review for a product
export async function addReview(productId, reviewData) {
  if (!auth.currentUser) {
    alert("Please login to submit a review.");
    return false;
  }
  try {
    // Ensure the parent document for the product exists before adding a review.
    // This prevents errors when adding the first review for a product.
    const productReviewDoc = doc(db, "reviews", productId);
    await setDoc(productReviewDoc, { lastUpdated: serverTimestamp() }, { merge: true });

    // Now, add the review to the 'items' subcollection.
    const review = {
      rating: reviewData.rating,
      comment: reviewData.comment || "",
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email || null,
      createdAt: serverTimestamp()
    };
    const reviewsCol = collection(productReviewDoc, "items");
    await addDoc(reviewsCol, review);
    return true;
  } catch (error) {
    console.error("Error adding review:", error);
    return false;
  }
}

// Get all reviews for a product (sorted newest first)
export async function getReviews(productId) {
  try {
    const reviewsCol = collection(db, "reviews", productId, "items");
    const q = query(reviewsCol, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

// Update existing review
export async function updateReview(productId, reviewId, updatedData) {
  if (!auth.currentUser) return false;
  try {
    const reviewDoc = doc(db, "reviews", productId, "items", reviewId);
    await setDoc(reviewDoc, {
      ...updatedData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating review:", error);
    return false;
  }
}

// Delete review
export async function deleteReview(productId, reviewId) {
  if (!auth.currentUser) return false;
  try {
    const reviewDoc = doc(db, "reviews", productId, "items", reviewId);
    await deleteDoc(reviewDoc);
    return true;
  } catch (error) {
    console.error("Error deleting review:", error);
    return false;
  }
}

// Get average rating for a product
export async function getAverageRating(productId) {
  try {
    const reviews = await getReviews(productId);
    if (reviews.length === 0) return { average: 0, count: 0 };
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return {
      average: (totalRating / reviews.length).toFixed(1),
      count: reviews.length
    };
  } catch (error) {
    console.error("Error calculating average rating:", error);
    return { average: 0, count: 0 };
  }
}

// Display reviews in HTML (helper)
export function displayReviews(reviews, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  if (reviews.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #888;">No reviews yet. Be the first to write one!</p>';
    return;
  }
  reviews.forEach(review => {
    const reviewDiv = document.createElement("div");
    reviewDiv.className = "review-card"; // Use the modern review-card style
    const created = review.createdAt && review.createdAt.seconds
      ? new Date(review.createdAt.seconds * 1000)
      : (review.createdAt?.toDate ? review.createdAt.toDate() : null);
    reviewDiv.innerHTML = `
      <div class="review-card-header">
        <div class="review-author">${review.userEmail || 'Anonymous'}</div>
        <div class="review-rating">${'★'.repeat(review.rating || 0)}${'☆'.repeat(5 - (review.rating || 0))}</div>
      </div>
      <p class="review-text">${review.comment || ''}</p>
      <div class="review-date" style="font-size: 0.8rem; color: #888; text-align: right; margin-top: 0.5rem;">
        <div class="review-date">${created ? created.toLocaleDateString() : ''}</div>
      </div>
    `;
    container.appendChild(reviewDiv);
  });
}
