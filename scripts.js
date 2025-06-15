/**
 * Authentication Module
 * Handles user registration, login, and session management
 */

// DOM Elements
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// Error Elements
const nameError = document.getElementById('nameError');
const phoneError = document.getElementById('phoneError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const termsError = document.getElementById('termsError');
const loginPhoneError = document.getElementById('loginPhoneError');
const loginPasswordError = document.getElementById('loginPasswordError');

// Constants
const MIN_PASSWORD_LENGTH = 6;
const KENYA_PHONE_REGEX = /^[17]\d{8}$/; // Matches Kenyan phone numbers starting with 7 or 1
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Initialize auth module
if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}

if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

// Check if user is logged in (for protected pages)
document.addEventListener('DOMContentLoaded', () => {
    if (isProtectedPage() && !isLoggedIn()) {
        redirectToLogin();
    }
    
    // Update UI based on auth state
    updateAuthUI();
});

/**
 * Handle registration form submission
 */
function handleRegister(e) {
    e.preventDefault();
    
    // Get form values
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const gender = document.getElementById('gender').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    
    // Validate inputs
    let isValid = true;
    
    // Validate full name
    if (!fullName) {
        nameError.classList.remove('hidden');
        isValid = false;
    } else {
        nameError.classList.add('hidden');
    }
    
    // Validate phone
    if (!phone || !KENYA_PHONE_REGEX.test(phone)) {
        phoneError.classList.remove('hidden');
        isValid = false;
    } else {
        phoneError.classList.add('hidden');
    }
    
    // Validate email (optional)
    if (email && !EMAIL_REGEX.test(email)) {
        emailError.classList.remove('hidden');
        isValid = false;
    } else {
        emailError.classList.add('hidden');
    }
    
    // Validate password
    if (password.length < MIN_PASSWORD_LENGTH) {
        passwordError.classList.remove('hidden');
        isValid = false;
    } else {
        passwordError.classList.add('hidden');
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
        confirmPasswordError.classList.remove('hidden');
        isValid = false;
    } else {
        confirmPasswordError.classList.add('hidden');
    }
    
    // Validate terms
    if (!terms) {
        termsError.classList.remove('hidden');
        isValid = false;
    } else {
        termsError.classList.add('hidden');
    }
    
    // If valid, register user
    if (isValid) {
        registerUser({
            fullName,
            phone,
            email: email || null,
            gender,
            password,
            balance: 0,
            shares: 0,
            transactions: [],
            createdAt: new Date().toISOString()
        });
    }
}

/**
 * Handle login form submission
 */
function handleLogin(e) {
    e.preventDefault();
    
    // Get form values
    const phone = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate inputs
    let isValid = true;
    
    // Validate phone
    if (!phone || !KENYA_PHONE_REGEX.test(phone)) {
        loginPhoneError.classList.remove('hidden');
        isValid = false;
    } else {
        loginPhoneError.classList.add('hidden');
    }
    
    // Validate password
    if (!password) {
        loginPasswordError.classList.remove('hidden');
        isValid = false;
    } else {
        loginPasswordError.classList.add('hidden');
    }
    
    // If valid, attempt login
    if (isValid) {
        loginUser(phone, password, rememberMe);
    }
}

/**
 * Register a new user
 */
function registerUser(userData) {
    // In a real app, this would be an API call
    // For now, we'll use localStorage
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('earnKshUsers') || '[]');
    const userExists = users.some(user => user.phone === userData.phone);
    
    if (userExists) {
        showToast('User with this phone number already exists', 'error');
        return;
    }
    
    // Add new user
    users.push(userData);
    localStorage.setItem('earnKshUsers', JSON.stringify(users));
    
    // Log the user in
    loginUser(userData.phone, userData.password, true);
    
    // Show success message
    showToast('Registration successful!', 'success');
    
    // Redirect to jobs page
    setTimeout(() => {
        window.location.href = './jobs.html';
    }, 1500);
}

/**
 * Login a user
 */
function loginUser(phone, password, rememberMe) {
    // In a real app, this would be an API call
    const users = JSON.parse(localStorage.getItem('earnKshUsers') || '[]');
    const user = users.find(u => u.phone === phone && u.password === password);
    
    if (!user) {
        showToast('Invalid phone number or password', 'error');
        return;
    }
    
    // Create session
    const session = {
        userId: phone, // Using phone as unique ID
        loggedInAt: new Date().toISOString(),
        expiresAt: rememberMe 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 day
    };
    
    localStorage.setItem('earnKshSession', JSON.stringify(session));
    
    // Show success message
    showToast('Login successful!', 'success');
    
    // Redirect to jobs page
    setTimeout(() => {
        window.location.href = './jobs.html';
    }, 1500);
}

/**
 * Logout the current user
 */
function logoutUser() {
    localStorage.removeItem('earnKshSession');
    showToast('Logged out successfully', 'success');
    redirectToLogin();
}

/**
 * Check if a user is logged in
 */
function isLoggedIn() {
    const session = JSON.parse(localStorage.getItem('earnKshSession') || null);
    
    if (!session) return false;
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
        localStorage.removeItem('earnKshSession');
        return false;
    }
    
    return true;
}

/**
 * Get current user data
 */
function getCurrentUser() {
    if (!isLoggedIn()) return null;
    
    const session = JSON.parse(localStorage.getItem('earnKshSession'));
    const users = JSON.parse(localStorage.getItem('earnKshUsers') || '[]');
    
    return users.find(user => user.phone === session.userId) || null;
}

/**
 * Update current user data
 */
function updateCurrentUser(updatedData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('earnKshUsers') || '[]');
    const updatedUsers = users.map(user => 
        user.phone === currentUser.phone ? { ...user, ...updatedData } : user
    );
    
    localStorage.setItem('earnKshUsers', JSON.stringify(updatedUsers));
}

/**
 * Check if current page is protected (requires auth)
 */
function isProtectedPage() {
    const protectedPages = ['jobs.html', 'profile.html'];
    return protectedPages.some(page => window.location.pathname.endsWith(page));
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
    if (!window.location.pathname.endsWith('login.html')) {
        window.location.href = './login.html';
    }
}

/**
 * Update UI elements based on auth state
 */
function updateAuthUI() {
    // This would be used to show/hide login/logout buttons, etc.
    // Implementation depends on your specific UI needs
}

// Export functions for other modules to use
export {
    isLoggedIn,
    getCurrentUser,
    updateCurrentUser,
    logoutUser
};
