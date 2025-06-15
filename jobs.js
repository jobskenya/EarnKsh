/**
 * Jobs Module
 * Handles job listings, sharing, and earnings tracking
 */

import { isLoggedIn, getCurrentUser, updateCurrentUser } from './auth.js';
import { showToast, formatDate } from './utils.js';
import { showConfetti } from './animations.js';

// DOM Elements
const jobsContainer = document.getElementById('jobsContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const currentBalanceEl = document.getElementById('currentBalance');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const withdrawBtn = document.getElementById('withdrawBtn');
const shareModal = document.getElementById('shareModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalJobTitle = document.getElementById('modalJobTitle');
const shareLink = document.getElementById('shareLink');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const whatsappShareBtn = document.getElementById('whatsappShareBtn');
const facebookShareBtn = document.getElementById('facebookShareBtn');

// State
let currentJobs = [];
let displayedJobs = 6;
const JOBS_PER_LOAD = 6;
const EARNINGS_PER_SHARE = 100;
const WITHDRAWAL_THRESHOLD = 3000;

// Initialize jobs module
document.addEventListener('DOMContentLoaded', () => {
    if (jobsContainer) {
        loadJobs();
        updateEarningsDisplay();
        
        // Set up event listeners
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMoreJobs);
        }
        
        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', handleWithdrawal);
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                shareModal.classList.add('hidden');
            });
        }
        
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', copyShareLink);
        }
    }
});

/**
 * Load jobs from "API" (local storage for now)
 */
function loadJobs() {
    // In a real app, this would be an API call
    const fakeJobs = generateFakeJobs();
    currentJobs = fakeJobs;
    
    displayJobs(currentJobs.slice(0, displayedJobs));
}

/**
 * Load more jobs when "Load More" button is clicked
 */
function loadMoreJobs() {
    displayedJobs += JOBS_PER_LOAD;
    displayJobs(currentJobs.slice(0, displayedJobs));
    
    // Hide button if all jobs are displayed
    if (displayedJobs >= currentJobs.length) {
        loadMoreBtn.classList.add('hidden');
    }
}

/**
 * Display jobs in the container
 */
function displayJobs(jobs) {
    if (!jobsContainer) return;
    
    jobsContainer.innerHTML = '';
    
    jobs.forEach(job => {
        const jobCard = createJobCard(job);
        jobsContainer.appendChild(jobCard);
    });
}

/**
 * Create a job card element
 */
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1';
    
    card.innerHTML = `
        <div class="p-6">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-gray-800">${job.title}</h3>
                    <p class="text-gray-600 text-sm">${job.company}</p>
                </div>
                <div class="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <i class="${job.icon} text-xl"></i>
                </div>
            </div>
            <p class="text-gray-700 mb-6">${job.description}</p>
            <div class="flex justify-between items-center">
                <div>
                    <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">+Ksh ${EARNINGS_PER_SHARE}</span>
                    <span class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full ml-2">${job.category}</span>
                </div>
                <button class="share-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition" data-job-id="${job.id}">
                    Share
                </button>
            </div>
        </div>
    `;
    
    // Add event listener to share button
    const shareBtn = card.querySelector('.share-btn');
    shareBtn.addEventListener('click', () => openShareModal(job));
    
    return card;
}

/**
 * Open share modal with job details
 */
function openShareModal(job) {
    if (!shareModal || !modalJobTitle || !shareLink) return;
    
    modalJobTitle.textContent = job.title;
    
    // Generate a unique share link (in a real app, this would come from the backend)
    const shareUrl = `https://earnksh.co.ke/share/${job.id}?ref=${getCurrentUser()?.phone || 'guest'}`;
    shareLink.value = shareUrl;
    
    // Update share buttons
    whatsappShareBtn.href = `https://wa.me/?text=${encodeURIComponent(`Check out this ${job.title} opportunity on EarnKsh: ${shareUrl}`)}`;
    facebookShareBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    
    // Show modal
    shareModal.classList.remove('hidden');
}

/**
 * Copy share link to clipboard
 */
function copyShareLink() {
    if (!shareLink) return;
    
    shareLink.select();
    document.execCommand('copy');
    
    // Show feedback
    const originalText = copyLinkBtn.textContent;
    copyLinkBtn.textContent = 'Copied!';
    copyLinkBtn.classList.add('bg-green-600');
    
    setTimeout(() => {
        copyLinkBtn.textContent = originalText;
        copyLinkBtn.classList.remove('bg-green-600');
    }, 2000);
}

/**
 * Handle job sharing (simulate API call)
 */
function shareJob(jobId) {
    if (!isLoggedIn()) {
        showToast('Please log in to share jobs', 'error');
        return;
    }
    
    const user = getCurrentUser();
    if (!user) return;
    
    // In a real app, this would be an API call
    setTimeout(() => {
        // Simulate API response
        const success = Math.random() > 0.2; // 80% success rate for demo
        
        if (success) {
            // Update user balance
            const newBalance = (user.balance || 0) + EARNINGS_PER_SHARE;
            const newShares = (user.shares || 0) + 1;
            
            // Add transaction
            const job = currentJobs.find(j => j.id === jobId);
            const newTransaction = {
                id: `txn_${Date.now()}`,
                type: 'earning',
                amount: EARNINGS_PER_SHARE,
                description: job ? `Share: ${job.title}` : 'Job Share',
                date: new Date().toISOString(),
                status: 'completed'
            };
            
            const transactions = [...(user.transactions || []), newTransaction];
            
            // Update user data
            updateCurrentUser({
                balance: newBalance,
                shares: newShares,
                transactions
            });
            
            // Update UI
            updateEarningsDisplay();
            
            // Show success message
            showToast(`Success! You earned Ksh ${EARNINGS_PER_SHARE}`, 'success');
            
            // Check if balance reached threshold
            if (newBalance >= WITHDRAWAL_THRESHOLD) {
                showConfetti();
                showToast('Congratulations! You can now withdraw your earnings', 'success');
            }
        } else {
            showToast('Share not counted. Please try again', 'error');
        }
        
        // Close modal
        shareModal.classList.add('hidden');
    }, 1000);
}

/**
 * Handle withdrawal request
 */
function handleWithdrawal() {
    const user = getCurrentUser();
    if (!user) return;
    
    if ((user.balance || 0) < WITHDRAWAL_THRESHOLD) {
        showToast(`You need at least Ksh ${WITHDRAWAL_THRESHOLD} to withdraw`, 'error');
        return;
    }
    
    // In a real app, this would open a withdrawal modal or process directly
    const whatsappUrl = `https://wa.me/254712345678?text=${encodeURIComponent(
        `Withdrawal Request\n\nName: ${user.fullName}\nPhone: ${user.phone}\nAmount: Ksh ${user.balance}\n\nPlease process my withdrawal. Thank you!`
    )}`;
    
    window.open(whatsappUrl, '_blank');
    
    // For demo purposes, we'll simulate a withdrawal
    const newTransaction = {
        id: `wdr_${Date.now()}`,
        type: 'withdrawal',
        amount: user.balance,
        description: 'Withdrawal Request',
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    const transactions = [...(user.transactions || []), newTransaction];
    
    // Update user data (reset balance)
    updateCurrentUser({
        balance: 0,
        transactions
    });
    
    // Update UI
    updateEarningsDisplay();
    
    showToast('Withdrawal request sent! You will receive your payment within 24 hours', 'success');
}

/**
 * Update earnings display (balance, progress bar, etc.)
 */
function updateEarningsDisplay() {
    const user = getCurrentUser();
    if (!user || !currentBalanceEl) return;
    
    const balance = user.balance || 0;
    currentBalanceEl.textContent = balance;
    
    // Update progress bar
    const progressPercent = Math.min((balance / WITHDRAWAL_THRESHOLD) * 100, 100);
    progressBar.style.width = `${progressPercent}%`;
    progressText.textContent = `${Math.round(progressPercent)}%`;
    
    // Update withdrawal button
    if (balance >= WITHDRAWAL_THRESHOLD) {
        withdrawBtn.disabled = false;
        withdrawBtn.classList.remove('bg-gray-300', 'text-gray-600', 'cursor-not-allowed');
        withdrawBtn.classList.add('bg-green-600', 'hover:bg-green-700', 'text-white', 'cursor-pointer');
        withdrawBtn.textContent = 'Withdraw Now';
    } else {
        withdrawBtn.disabled = true;
        withdrawBtn.classList.add('bg-gray-300', 'text-gray-600', 'cursor-not-allowed');
        withdrawBtn.classList.remove('bg-green-600', 'hover:bg-green-700', 'text-white', 'cursor-pointer');
        withdrawBtn.textContent = `Reach Ksh ${WITHDRAWAL_THRESHOLD} to Withdraw`;
    }
}

/**
 * Generate fake jobs for demo purposes
 */
function generateFakeJobs() {
    return [
        {
            id: 'job_1',
            title: 'Install Tala App',
            company: 'Tala Kenya',
            description: 'Install the Tala app and get a loan up to Ksh 50,000. Share this link with friends to earn.',
            category: 'Finance',
            icon: 'fas fa-wallet'
        },
        {
            id: 'job_2',
            title: 'Sign Up for Glovo',
            company: 'Glovo Kenya',
            description: 'Get free delivery on your first order when you sign up through this link. Share with friends to earn.',
            category: 'Shopping',
            icon: 'fas fa-shopping-bag'
        },
        {
            id: 'job_3',
            title: 'Join Uber Driver',
            company: 'Uber Kenya',
            description: 'Become an Uber driver and earn flexible income. Share this opportunity with friends.',
            category: 'Transport',
            icon: 'fas fa-car'
        },
        {
            id: 'job_4',
            title: 'Try Jumia Prime',
            company: 'Jumia Kenya',
            description: 'Get free delivery on all orders with Jumia Prime. Share this offer with friends to earn.',
            category: 'Shopping',
            icon: 'fas fa-tag'
        },
        {
            id: 'job_5',
            title: 'Open KCB Account',
            company: 'KCB Bank',
            description: 'Open a KCB M-Pesa account with no fees. Share this link with friends to earn.',
            category: 'Banking',
            icon: 'fas fa-university'
        },
        {
            id: 'job_6',
            title: 'Download MyDawa App',
            company: 'MyDawa',
            description: 'Get 10% off your first medicine order. Share this link with friends to earn.',
            category: 'Health',
            icon: 'fas fa-heartbeat'
        },
        {
            id: 'job_7',
            title: 'Sign Up for Zuku',
            company: 'Zuku Fiber',
            description: 'Get 1 month free internet when you sign up for Zuku Fiber. Share with friends to earn.',
            category: 'Internet',
            icon: 'fas fa-wifi'
        },
        {
            id: 'job_8',
            title: 'Join Bolt Driver',
            company: 'Bolt Kenya',
            description: 'Earn money driving with Bolt. Share this opportunity with friends.',
            category: 'Transport',
            icon: 'fas fa-taxi'
        },
        {
            id: 'job_9',
            title: 'Try Netflix 1 Month Free',
            company: 'Netflix Kenya',
            description: 'Get 1 month free Netflix subscription. Share this offer with friends to earn.',
            category: 'Entertainment',
            icon: 'fas fa-film'
        }
    ];
}
