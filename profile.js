/**
 * Profile Module
 * Handles user profile display and transactions
 */

import { isLoggedIn, getCurrentUser, logoutUser } from './auth.js';
import { showToast, formatDate } from './utils.js';
import { showConfetti } from './animations.js';

// DOM Elements
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userPhone = document.getElementById('userPhone');
const userEmail = document.getElementById('userEmail');
const profileBalance = document.getElementById('profileBalance');
const availableBalance = document.getElementById('availableBalance');
const profileProgressBar = document.getElementById('profileProgressBar');
const profileProgressText = document.getElementById('profileProgressText');
const profileWithdrawBtn = document.getElementById('profileWithdrawBtn');
const totalShares = document.getElementById('totalShares');
const successfulShares = document.getElementById('successfulShares');
const pendingShares = document.getElementById('pendingShares');
const referrals = document.getElementById('referrals');
const referralLink = document.getElementById('referralLink');
const copyReferralBtn = document.getElementById('copyReferralBtn');
const whatsappReferralBtn = document.getElementById('whatsappReferralBtn');
const facebookReferralBtn = document.getElementById('facebookReferralBtn');
const transactionsTable = document.getElementById('transactionsTable');
const withdrawalModal = document.getElementById('withdrawalModal');
const closeWithdrawalModalBtn = document.getElementById('closeWithdrawalModalBtn');
const withdrawalPhone = document.getElementById('withdrawalPhone');
const mpesaNumber = document.getElementById('mpesaNumber');
const confirmWithdrawalBtn = document.getElementById('confirmWithdrawalBtn');

// Constants
const WITHDRAWAL_THRESHOLD = 3000;
const REFERRAL_BONUS = 500;

// Initialize profile module
document.addEventListener('DOMContentLoaded', () => {
    if (userName) {
        loadProfileData();
        loadTransactions();
        
        // Set up event listeners
        if (copyReferralBtn) {
            copyReferralBtn.addEventListener('click', copyReferralLink);
        }
        
        if (profileWithdrawBtn) {
            profileWithdrawBtn.addEventListener('click', () => {
                withdrawalModal.classList.remove('hidden');
            });
        }
        
        if (closeWithdrawalModalBtn) {
            closeWithdrawalModalBtn.addEventListener('click', () => {
                withdrawalModal.classList.add('hidden');
            });
        }
        
        if (confirmWithdrawalBtn) {
            confirmWithdrawalBtn.addEventListener('click', handleWithdrawal);
        }
    }
});

/**
 * Load and display user profile data
 */
function loadProfileData() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Set user details
    userName.textContent = user.fullName || 'User';
    userPhone.textContent = `+254${user.phone}` || '';
    userEmail.textContent = user.email || 'Not provided';
    
    // Set avatar based on gender
    if (user.gender === 'female') {
        userAvatar.src = `https://randomuser.me/api/portraits/women/${Math.floor(Math.random() * 100)}.jpg`;
    } else {
        userAvatar.src = `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`;
    }
    
    // Set earnings
    const balance = user.balance || 0;
    profileBalance.textContent = balance;
    availableBalance.textContent = balance >= WITHDRAWAL_THRESHOLD ? WITHDRAWAL_THRESHOLD : balance;
    
    // Update progress bar
    const progressPercent = Math.min((balance / WITHDRAWAL_THRESHOLD) * 100, 100);
    profileProgressBar.style.width = `${progressPercent}%`;
    profileProgressText.textContent = `${Math.round(progressPercent)}%`;
    
    // Update withdrawal button
    if (balance >= WITHDRAWAL_THRESHOLD) {
        profileWithdrawBtn.disabled = false;
        profileWithdrawBtn.classList.remove('bg-gray-300', 'text-gray-600', 'cursor-not-allowed');
        profileWithdrawBtn.classList.add('bg-green-600', 'hover:bg-green-700', 'text-white', 'cursor-pointer');
        profileWithdrawBtn.textContent = 'Withdraw Now';
    } else {
        profileWithdrawBtn.disabled = true;
        profileWithdrawBtn.classList.add('bg-gray-300', 'text-gray-600', 'cursor-not-allowed');
        profileWithdrawBtn.classList.remove('bg-green-600', 'hover:bg-green-700', 'text-white', 'cursor-pointer');
        profileWithdrawBtn.textContent = `Reach Ksh ${WITHDRAWAL_THRESHOLD} to Withdraw`;
    }
    
    // Set stats
    totalShares.textContent = user.shares || 0;
    successfulShares.textContent = user.transactions?.filter(t => t.type === 'earning' && t.status === 'completed').length || 0;
    pendingShares.textContent = user.transactions?.filter(t => t.status === 'pending').length || 0;
    referrals.textContent = user.referrals || 0;
    
    // Set referral link
    const referralUrl = `https://earnksh.co.ke/register?ref=${user.phone}`;
    referralLink.value = referralUrl;
    whatsappReferralBtn.href = `https://wa.me/?text=${encodeURIComponent(`Join EarnKsh using my referral link and get Ksh 500 bonus: ${referralUrl}`)}`;
    facebookReferralBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;
    
    // Set withdrawal phone
    if (withdrawalPhone) {
        withdrawalPhone.textContent = `+254${user.phone}`;
    }
    
    if (mpesaNumber) {
        mpesaNumber.value = user.phone;
    }
}

/**
 * Load and display transactions
 */
function loadTransactions() {
    const user = getCurrentUser();
    if (!user || !transactionsTable) return;
    
    // Clear existing rows
    transactionsTable.innerHTML = '';
    
    // Get last 5 transactions (or all if less than 5)
    const transactions = (user.transactions || []).slice(-5).reverse();
    
    if (transactions.length === 0) {
        transactionsTable.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">No transactions yet</td>
            </tr>
        `;
        return;
    }
    
    transactions.forEach(txn => {
        const row = document.createElement('tr');
        
        // Determine status color and icon
        let statusClass = '';
        let statusIcon = '';
        
        switch (txn.status) {
            case 'completed':
                statusClass = 'bg-green-100 text-green-800';
                statusIcon = 'fas fa-check-circle text-green-500';
                break;
            case 'pending':
                statusClass = 'bg-yellow-100 text-yellow-800';
                statusIcon = 'fas fa-clock text-yellow-500';
                break;
            case 'failed':
                statusClass = 'bg-red-100 text-red-800';
                statusIcon = 'fas fa-times-circle text-red-500';
                break;
            default:
                statusClass = 'bg-gray-100 text-gray-800';
                statusIcon = 'fas fa-info-circle text-gray-500';
        }
        
        // Determine amount color
        const amountClass = txn.type === 'earning' ? 'text-green-600' : 'text-red-600';
        const amountSign = txn.type === 'earning' ? '+' : '-';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(txn.date)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${txn.description}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">${txn.type}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${amountClass}">${amountSign}Ksh ${txn.amount}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    <i class="${statusIcon} mr-1"></i> ${txn.status}
                </span>
            </td>
        `;
        
        transactionsTable.appendChild(row);
    });
}

/**
 * Copy referral link to clipboard
 */
function copyReferralLink() {
    if (!referralLink) return;
    
    referralLink.select();
    document.execCommand('copy');
    
    // Show feedback
    const originalText = copyReferralBtn.textContent;
    copyReferralBtn.textContent = 'Copied!';
    copyReferralBtn.classList.add('bg-green-600');
    
    setTimeout(() => {
        copyReferralBtn.textContent = originalText;
        copyReferralBtn.classList.remove('bg-green-600');
    }, 2000);
}

/**
 * Handle withdrawal request
 */
function handleWithdrawal() {
    const user = getCurrentUser();
    if (!user) return;
    
    const balance = user.balance || 0;
    
    if (balance < WITHDRAWAL_THRESHOLD) {
        showToast(`You need at least Ksh ${WITHDRAWAL_THRESHOLD} to withdraw`, 'error');
        withdrawalModal.classList.add('hidden');
        return;
    }
    
    // Get M-Pesa number
    const mpesa = mpesaNumber.value.trim();
    if (!mpesa || !/^[17]\d{8}$/.test(mpesa)) {
        showToast('Please enter a valid M-Pesa number', 'error');
        return;
    }
    
    // In a real app, this would be an API call
    // For demo, we'll simulate a WhatsApp message
    const whatsappUrl = `https://wa.me/254712345678?text=${encodeURIComponent(
        `Withdrawal Request\n\nName: ${user.fullName}\nPhone: +254${mpesa}\nAmount: Ksh ${WITHDRAWAL_THRESHOLD}\n\nPlease process my withdrawal. Thank you!`
    )}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Add withdrawal transaction
    const newTransaction = {
        id: `wdr_${Date.now()}`,
        type: 'withdrawal',
        amount: WITHDRAWAL_THRESHOLD,
        description: 'Withdrawal to M-Pesa',
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    const transactions = [...(user.transactions || []), newTransaction];
    
    // Update user data (deduct withdrawn amount)
    updateCurrentUser({
        balance: balance - WITHDRAWAL_THRESHOLD,
        transactions
    });
    
    // Update UI
    loadProfileData();
    loadTransactions();
    
    // Close modal
    withdrawalModal.classList.add('hidden');
    
    showToast('Withdrawal request sent! You will receive your payment within 24 hours', 'success');
}
