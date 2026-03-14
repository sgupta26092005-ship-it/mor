import { auth, db } from './src/auth.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const placeOrderBtn = document.querySelector('.place-order-btn');
    const shippingForm = document.getElementById('shipping-form');

    const summaryItemsList = document.getElementById('summary-items-list');
    const summarySubtotalEl = document.getElementById('summary-subtotal');
    const summaryTotalEl = document.getElementById('summary-total');

    if (!placeOrderBtn || !shippingForm) {
        console.error("Checkout form elements not found.");
        return;
    }

    // --- Render Order Summary on Page Load ---
    const renderOrderSummary = () => {
        const cartItems = JSON.parse(localStorage.getItem('mor_cart')) || [];

        if (cartItems.length === 0) {
            alert("Your cart is empty. Redirecting to shop.");
            window.location.href = 'shop.html';
            return;
        }

        summaryItemsList.innerHTML = ''; // Clear placeholder
        let subtotal = 0;

        cartItems.forEach(item => {
            const priceValue = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
            subtotal += priceValue * item.quantity;

            // Ensure the image path is correct, as it might be stored without the 'photos/' prefix.
            const imagePath = item.imgSrc.startsWith('photos/') ? item.imgSrc : `photos/${item.imgSrc}`;

            const itemEl = document.createElement('div');
            itemEl.className = 'summary-item';
            itemEl.innerHTML = `
                <img src="${imagePath}" alt="${item.name}" class="summary-item-img">
                <div class="summary-item-info">
                    <div class="summary-item-name">${item.name}</div>
                    <div>Qty: ${item.quantity}</div>
                </div>
                <div class="summary-item-price">${item.price}</div>
            `;
            summaryItemsList.appendChild(itemEl);
        });

        summarySubtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
        summaryTotalEl.textContent = `₹${subtotal.toFixed(2)}`; // Assuming free shipping
    };

    renderOrderSummary();

    placeOrderBtn.addEventListener('click', async () => {
        // 1. Check for logged-in user
        if (!auth.currentUser) {
            alert('You must be logged in to place an order.');
            window.location.href = `login.html?redirect=checkout.html`;
            return;
        }

        // 2. Validate the form
        if (!shippingForm.checkValidity()) {
            // You can show a more elegant message here
            alert('Please fill out all required shipping details.');
            shippingForm.reportValidity(); // This will show the browser's native validation messages
            return;
        }

        // 3. Get cart items and shipping details
        const cartItems = JSON.parse(localStorage.getItem('mor_cart')) || [];
        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const shippingAddress = {
            fullName: document.getElementById('full-name').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            pincode: document.getElementById('pincode').value,
            phone: document.getElementById('phone').value,
        };

        const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price.replace('₹', '').replace(',', '')) * item.quantity), 0);

        // 4. Construct the order object
        const orderData = {
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email,
            items: cartItems,
            shippingAddress: shippingAddress,
            subtotal: subtotal,
            total: subtotal, // Assuming free shipping for now
            status: 'placed',
            createdAt: serverTimestamp()
        };

        // 5. Initiate Razorpay Payment
        const options = {
            key: "YOUR_RAZORPAY_KEY_ID", // Replace with your actual Key ID
            amount: orderData.total * 100, // Amount in the smallest currency unit (paise)
            currency: "INR",
            name: "Mor",
            description: "Test Transaction",
            image: "logo.jpg", // URL to your logo
            handler: async function (response) {
                // This function is called on successful payment
                console.log("Razorpay response:", response);
                
                // Add payment details to the order
                orderData.paymentId = response.razorpay_payment_id;
                orderData.status = 'paid';

                try {
                    // 6. Save the final order to Firestore AFTER successful payment
                    await addDoc(collection(db, "orders"), orderData);
                    alert('Thank you for your order! It has been placed successfully.');
                    localStorage.removeItem('mor_cart'); // Clear the cart
                    window.location.href = 'index.html'; // Redirect to home
                } catch (error) {
                    console.error("Error saving order after payment: ", error);
                    alert('Payment was successful, but we had an issue saving your order. Please contact support.');
                }
            },
            prefill: {
                name: shippingAddress.fullName,
                email: orderData.userEmail,
                contact: shippingAddress.phone
            },
            theme: {
                color: "#3a3a3a"
            },
            modal: {
                ondismiss: function() {
                    alert('Payment was cancelled. Your order has not been placed.');
                }
            }
        };
        const rzp1 = new Razorpay(options);
        rzp1.open();
    });
});