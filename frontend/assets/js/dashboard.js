// assets/js/dashboard.js
// REQUIRE: common.js must be included before this script
let currentPage = 1;
let totalPages = 1;

function updateUserInfoDisplay() {
    const user = window.getAuthUser ? window.getAuthUser() : null;
    if (user) {
        document.getElementById('userInfo').textContent = `${user.username} (${user.role})`;
    }
}

async function loadStatistics() {
    const data = await window.apiRequest('/ioc/stats');
    if (data && data.success) {
        document.getElementById('totalIOCs').textContent = data.data.total;

        const urlCount = data.data.byType.find(t => t.type === 'url')?.count || 0;
        const ipCount = data.data.byType.find(t => t.type === 'ip')?.count || 0;
        const domainCount = data.data.byType.find(t => t.type === 'domain')?.count || 0;

        document.getElementById('totalURLs').textContent = urlCount;
        document.getElementById('totalIPs').textContent = ipCount;
        document.getElementById('totalDomains').textContent = domainCount;
    }
}

async function loadIOCs() {
    const type = document.getElementById('filterType').value;
    const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sortBy: 'created_at',
        sortOrder: 'DESC'
    });

    if (type) params.append('type', type);

    const data = await window.apiRequest(`/ioc?${params}`);

    if (data && data.success) {
        const tbody = document.getElementById('iocTable');

        if (data.data.iocs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-gray-400">
                        No IOCs found
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.data.iocs.map(ioc => `
            <tr class="hover:bg-gray-700">
                <td class="px-4 py-2">
                    <span class="px-2 py-1 rounded text-xs ${
                        ioc.type === 'url' ? 'bg-blue-900 text-blue-200' :
                        ioc.type === 'ip' ? 'bg-green-900 text-green-200' :
                        'bg-purple-900 text-purple-200'
                    }">
                        ${ioc.type.toUpperCase()}
                    </span>
                </td>
                <td class="px-4 py-2 font-mono text-sm truncate max-w-xs" title="${ioc.value}">
                    ${ioc.value}
                </td>
                <td class="px-4 py-2 text-sm">${ioc.threat || '-'}</td>
                <td class="px-4 py-2">
                    <span class="px-2 py-1 rounded text-xs ${
                        ioc.status === 'online' ? 'bg-red-900 text-red-200' :
                        ioc.status === 'offline' ? 'bg-gray-600 text-gray-200' :
                        'bg-yellow-900 text-yellow-200'
                    }">
                        ${ioc.status}
                    </span>
                </td>
                <td class="px-4 py-2 text-sm">${new Date(ioc.date_added || ioc.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');

        totalPages = data.data.pagination.totalPages;
        document.getElementById('pageInfo').textContent =
            `Page ${currentPage} of ${totalPages}`;

        document.getElementById('prevBtn').disabled = currentPage === 1;
        document.getElementById('nextBtn').disabled = currentPage === totalPages;
    }
}

function changePage(delta) {
    currentPage += delta;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    loadIOCs();
}

async function queryURLhaus() {
    const query = document.getElementById('queryInput').value.trim();
    const resultDiv = document.getElementById('queryResult');
    const resultText = document.getElementById('queryResultText');

    if (!query) {
        alert('Please enter a URL, IP, or domain');
        return;
    }

    resultDiv.classList.remove('hidden');
    resultText.textContent = 'Querying...';

    const isURL = query.startsWith('http://') || query.startsWith('https://');
    const endpoint = isURL ? '/urlhaus/query/url' : '/urlhaus/query/host';
    const body = isURL ? { url: query } : { host: query };

    const data = await window.apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    });

    if (data) {
        resultText.textContent = JSON.stringify(data, null, 2);
        if (data.success) {
            loadIOCs();
            loadStatistics();
        }
    } else {
        resultText.textContent = 'Error querying URLhaus';
    }
}

// Initialize page
if (window.checkAuth && window.checkAuth()) {
    updateUserInfoDisplay();
    loadStatistics();
    loadIOCs();
}