/**
 * Card Component
 * Reusable card component for jobs, transactions, etc.
 */

/**
 * Create a job card
 * @param {Object} job - Job data
 * @returns {HTMLElement} Card element
 */
export function createJobCard(job) {
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
                    <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">+Ksh ${job.earnings || 100}</span>
                    <span class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full ml-2">${job.category}</span>
                </div>
                <button class="share-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition" data-job-id="${job.id}">
                    Share
                </button>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Create a transaction card
 * @param {Object} transaction - Transaction data
 * @returns {HTMLElement} Card element
 */
export function createTransactionCard(transaction) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow p-4 mb-4';
    
    // Determine status color and icon
    let statusClass = '';
    let statusIcon = '';
    
    switch (transaction.status) {
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
    const amountClass = transaction.type === 'earning' ? 'text-green-600' : 'text-red-600';
    const amountSign = transaction.type === 'earning' ? '+' : '-';
    
    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <h4 class="font-medium text-gray-800">${transaction.description}</h4>
                <p class="text-sm text-gray-500">${new Date(transaction.date).toLocaleDateString()}</p>
            </div>
            <div class="text-right">
                <p class="${amountClass} font-medium">${amountSign}Ksh ${transaction.amount}</p>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusClass}">
                    <i class="${statusIcon} mr-1"></i> ${transaction.status}
                </span>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Create a stats card
 * @param {Object} stats - Stats data
 * @returns {HTMLElement} Card element
 */
export function createStatsCard(stats) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-md p-6';
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-6">
            <div>
                <h3 class="text-lg font-bold text-gray-800">${stats.title}</h3>
                <p class="text-gray-600 text-sm">${stats.subtitle}</p>
            </div>
            <div class="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <i class="${stats.icon} text-xl"></i>
            </div>
        </div>
        <div class="text-3xl font-bold text-gray-900">${stats.value}</div>
        ${stats.change ? `
            <div class="mt-2 flex items-center ${stats.change >= 0 ? 'text-green-600' : 'text-red-600'}">
                ${stats.change >= 0 ? '<i class="fas fa-arrow-up mr-1"></i>' : '<i class="fas fa-arrow-down mr-1"></i>'}
                <span class="text-sm font-medium">${Math.abs(stats.change)}% from last week</span>
            </div>
        ` : ''}
    `;
    
    return card;
}
