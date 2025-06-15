/**
 * Utility Functions
 * Shared functionality used across the application
 */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 * @param {number} duration - How long to show the toast in ms (default: 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed bottom-4 right-4 z-50 space-y-2';
        document.body.appendChild(toastContainer);
    }
    
    // Determine toast color based on type
    let bgColor = 'bg-blue-600';
    let icon = 'fas fa-info-circle';
    
    switch (type) {
        case 'success':
            bgColor = 'bg-green-600';
            icon = 'fas fa-check-circle';
            break;
        case 'error':
            bgColor = 'bg-red-600';
            icon = 'fas fa-times-circle';
            break;
        case 'warning':
            bgColor = 'bg-yellow-600';
            icon = 'fas fa-exclamation-circle';
            break;
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-start animate-fade-in-up`;
    toast.innerHTML = `
        <i class="${icon} mr-3 mt-0.5"></i>
        <div>${message}</div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Remove toast after duration
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => {
            toast.remove();
            // Remove container if no toasts left
            if (toastContainer.children.length === 0) {
                toastContainer.remove();
            }
        }, 300);
    }, duration);
}

/**
 * Format date to a readable string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Generate a random ID
 * @param {number} length - Length of the ID (default: 8)
 * @returns {string} Random ID string
 */
export function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Debounce a function
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Throttle a function
 * @param {Function} func - The function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Format currency (Kenya Shillings)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Validate Kenyan phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateKenyanPhone(phone) {
    return /^[17]\d{8}$/.test(phone);
}

/**
 * Simulate API call (for demo purposes)
 * @param {string} endpoint - The endpoint to call
 * @param {Object} data - The data to send
 * @param {string} method - HTTP method (default: 'GET')
 * @returns {Promise} Promise that resolves with mock data
 */
export function mockApiCall(endpoint, data = {}, method = 'GET') {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate network delay
            const randomError = Math.random() < 0.1; // 10% chance of error
            
            if (randomError) {
                reject({
                    status: 500,
                    message: 'Internal server error'
                });
                return;
            }
            
            // Mock responses for different endpoints
            let response;
            
            switch (endpoint) {
                case '/auth/login':
                    response = {
                        status: 200,
                        data: {
                            token: 'mock_token_' + generateId(32),
                            user: {
                                ...data,
                                balance: 0,
                                shares: 0,
                                transactions: []
                            }
                        }
                    };
                    break;
                
                case '/auth/register':
                    response = {
                        status: 201,
                        data: {
                            user: {
                                ...data,
                                balance: 0,
                                shares: 0,
                                transactions: []
                            }
                        }
                    };
                    break;
                
                case '/jobs':
                    response = {
                        status: 200,
                        data: [
                            // Mock jobs data would go here
                        ]
                    };
                    break;
                
                case '/share':
                    response = {
                        status: 200,
                        data: {
                            success: true,
                            earnings: 100
                        }
                    };
                    break;
                
                case '/withdraw':
                    response = {
                        status: 200,
                        data: {
                            success: true,
                            message: 'Withdrawal request received'
                        }
                    };
                    break;
                
                default:
                    response = {
                        status: 404,
                        message: 'Endpoint not found'
                    };
            }
            
            resolve(response);
        }, 500); // Simulate network delay
    });
}
