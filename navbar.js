/**
 * Navigation Bar Component
 * Persistent navigation bar with auth state awareness
 */

import { isLoggedIn, getCurrentUser, logoutUser } from '../scripts/auth.js';

// DOM Elements
const navbarContainer = document.getElementById('navbar-container');

// Initialize navbar
if (navbarContainer) {
    renderNavbar();
    
    // Update navbar when auth state changes
    document.addEventListener('authStateChange', renderNavbar);
}

/**
 * Render the navigation bar based on auth state
 */
function renderNavbar() {
    const user = getCurrentUser();
    const isAuthenticated = isLoggedIn();
    
    navbarContainer.innerHTML = `
        <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
            <div class="max-w-6xl mx-auto px-4">
                <div class="flex justify-between">
                    <a href="./index.html" class="flex flex-col items-center py-3 px-4 text-gray-600 hover:text-blue-600 transition">
                        <i class="fas fa-home text-xl mb-1"></i>
                        <span class="text-xs">Home</span>
                    </a>
                    <a href="./jobs.html" class="flex flex-col items-center py-3 px-4 text-gray-600 hover:text-blue-600 transition">
                        <i class="fas fa-briefcase text-xl mb-1"></i>
                        <span class="text-xs">Jobs</span>
                    </a>
                    <a href="${isAuthenticated ? './profile.html' : './login.html'}" class="flex flex-col items-center py-3 px-4 text-gray-600 hover:text-blue-600 transition">
                        <i class="fas fa-user text-xl mb-1"></i>
                        <span class="text-xs">${isAuthenticated ? 'Profile' : 'Login'}</span>
                    </a>
                </div>
            </div>
        </nav>
        
        <!-- Add padding to the bottom of the body to account for fixed navbar -->
        <style>
            body {
                padding-bottom: 72px;
            }
            
            @media (min-width: 768px) {
                body {
                    padding-bottom: 0;
                }
                
                nav {
                    top: 0;
                    bottom: auto;
                    border-top: 0;
                    border-bottom: 1px solid #e5e7eb;
                }
            }
        </style>
    `;
    
    // For desktop, we might want a more traditional top navbar
    const desktopNavbar = `
        <nav class="hidden md:block bg-white border-b border-gray-200 shadow-sm">
            <div class="max-w-6xl mx-auto px-4">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="./index.html" class="flex items-center text-blue-600 font-bold text-xl">
                            <i class="fas fa-coins mr-2"></i>
                            EarnKsh
                        </a>
                    </div>
                    <div class="flex items-center space-x-8">
                        <a href="./index.html" class="text-gray-600 hover:text-blue-600 transition">Home</a>
                        <a href="./jobs.html" class="text-gray-600 hover:text-blue-600 transition">Jobs</a>
                        ${isAuthenticated ? `
                            <div class="relative group">
                                <button class="flex items-center text-gray-600 hover:text-blue-600 transition">
                                    <span>${user?.fullName || 'Account'}</span>
                                    <i class="fas fa-chevron-down ml-1 text-xs"></i>
                                </button>
                                <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                                    <a href="./profile.html" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</a>
                                    <button id="logoutBtn" class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Logout</button>
                                </div>
                            </div>
                        ` : `
                            <a href="./login.html" class="text-gray-600 hover:text-blue-600 transition">Login</a>
                        `}
                    </div>
                </div>
            </div>
        </nav>
    `;
    
    // Insert desktop navbar at the top
    navbarContainer.insertAdjacentHTML('afterbegin', desktopNavbar);
    
    // Add logout event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
}
