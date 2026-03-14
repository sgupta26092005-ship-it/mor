import { auth, initializeUserCart } from './src/auth.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";


document.addEventListener('DOMContentLoaded', () => {
    const toggleViewLink = document.getElementById('toggle-view-link');
    const forgotPasswordLink = document.getElementById('forgot-password-link');

    if (toggleViewLink && forgotPasswordLink) {
        let currentView = 'login'; 

        const title = document.getElementById('login-modal-title');
        const subtitle = document.getElementById('login-modal-subtitle');
        const emailLabel = document.querySelector('label[for="login-email"]');
        const emailGroup = document.querySelector('#login-form .form-group:first-of-type');
        const emailInput = document.getElementById('login-email');
        const passwordGroup = document.getElementById('login-password').parentElement;
        const confirmGroup = document.getElementById('confirm-password-group');
        const confirmInput = document.getElementById('confirm-password');
        const submitBtn = document.getElementById('login-submit-btn');
        const toggleText = document.getElementById('toggle-view-text');
        const forgotPasswordGroup = document.getElementById('forgot-password-group');

        const updateView = () => {
            emailGroup.style.display = 'block';
            emailInput.placeholder = "you@example.com";
            passwordGroup.style.display = 'block';
            confirmGroup.style.display = 'none';
            confirmInput.required = false;
            forgotPasswordGroup.style.display = 'block';

            if (currentView === 'login') {
                title.textContent = 'Welcome Back';
                subtitle.textContent = 'Log in to access your account and favorites.';
                submitBtn.textContent = 'Log In';
                toggleText.textContent = "Don't have an account? ";
                toggleViewLink.textContent = 'Create your account';
                emailLabel.textContent = 'Email';
                emailInput.type = 'email';
                emailInput.placeholder = 'you@example.com';

            } else if (currentView === 'signup') {
                title.textContent = 'Create Account';
                subtitle.textContent = 'Join us to save your favorites and more.';
                submitBtn.textContent = 'Sign Up';
                confirmGroup.style.display = 'block';
                confirmInput.required = true;
                forgotPasswordGroup.style.display = 'none';
                toggleText.textContent = 'Already have an account? ';
                toggleViewLink.textContent = 'Log in';
            } else if (currentView === 'forgotPassword') {
                title.textContent = 'Reset Password';
                subtitle.textContent = 'Enter your email to receive a password reset link.';
                submitBtn.textContent = 'Send Reset Link';
                passwordGroup.style.display = 'none';
                forgotPasswordGroup.style.display = 'none';
                toggleText.textContent = 'Remembered your password? ';
                toggleViewLink.textContent = 'Back to Login';
            }
        };

        toggleViewLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentView === 'login') {
                currentView = 'signup';
            } else if (currentView === 'signup') {
                currentView = 'login';
            } else {
                currentView = 'login';
            }
            updateView();
        });

        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentView = 'forgotPassword';
            updateView();
        });

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const handleSuccessfulLogin = async () => {
                try {
                    // Initialize cart data
                    if (auth.currentUser) {
                        await initializeUserCart(auth.currentUser);
                    }
                    
                    // Redirect
                    window.location.href = 'index.html';

                } catch (error) {
                    console.error("Error initializing cart after login:", error);
                }
            };

            const email = emailInput.value;
            const password = document.getElementById('login-password').value;

            try {
                if (currentView === 'signup') {
                    const confirmPassword = confirmInput.value;
                    if (password !== confirmPassword) return alert('Passwords do not match!');
                    await createUserWithEmailAndPassword(auth, email, password);
                    alert('✅ Account created successfully!');
                    handleSuccessfulLogin();
                } else if (currentView === 'login') {
                    await signInWithEmailAndPassword(auth, email, password);
                    alert('✅ Login successful!');
                    handleSuccessfulLogin();
                } else if (currentView === 'forgotPassword') {
                    await sendPasswordResetEmail(auth, email);
                    window.showToast('Password reset email sent! Check your inbox.', 'fa-paper-plane');
                    currentView = 'login';
                    updateView();
                }
            } catch (err) {
                alert(`❌ ${err.message}`);
            }
        });

        document.querySelectorAll('.toggle-password').forEach(icon => {
            icon.addEventListener('click', () => {
                const input = icon.previousElementSibling;
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }
});