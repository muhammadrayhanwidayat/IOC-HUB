// assets/js/admin.js
// REQUIRE: common.js must be included before this script in admin.html
let currentPage = 1;
let totalPages = 1;

function updateUserInfoDisplay() {
    const user = window.getAuthUser ? window.getAuthUser() : null;
    if (user) {
        document.getElementById('userInfo').textContent = `${user.username} (Admin)`;
    }
}

async function loadStatistics() {
    const data = await window.apiRequest('/ioc/stats');
    console.log('STATISTICS RESPONSE:', data);
    if (data && data.success) {
        console.log('STATISTICS RESPONSE:', data);
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
    const status = document.getElementById('filterStatus').value;
    const search = document.getElementById('searchInput').value;

    const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sortBy: 'created_at',
        sortOrder: 'DESC'
    });

    if (type) params.append('type', type);
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const data = await window.apiRequest(`/ioc?${params}`);
    if (data && data.success) {
        const tbody = document.getElementById('iocTable');

        if (data.data.iocs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-gray-400">
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
                <td class="px-4 py-2 font-mono text-xs truncate max-w-xs" title="${ioc.value}">
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
                <td class="px-4 py-2 text-sm">${ioc.reporter || '-'}</td>
                <td class="px-4 py-2 text-sm">${new Date(ioc.date_added || ioc.created_at).toLocaleDateString()}</td>
                <td class="px-4 py-2">
                    <button onclick="deleteIOC(${ioc.id})" 
                        class="text-red-400 hover:text-red-300 text-sm">
                        Delete
                    </button>
                </td>
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

async function syncURLs() {
    const limit = document.getElementById('syncLimit').value;
    const resultDiv = document.getElementById('syncResult');
    const resultText = document.getElementById('syncResultText');

    resultDiv.classList.remove('hidden');
    resultText.textContent = 'Syncing URLs from URLhaus...';

    const data = await window.apiRequest(`/urlhaus/sync/urls?limit=${limit}`);

    if (data) {
        if (data.success) {
            resultText.textContent = `✓ ${data.message}`;
            resultText.className = 'text-sm text-green-300';
            loadIOCs();
            loadStatistics();
        } else {
            resultText.textContent = `✗ ${data.message}`;
            resultText.className = 'text-sm text-red-300';
        }
    } else {
        resultText.textContent = '✗ Error syncing URLs';
        resultText.className = 'text-sm text-red-300';
    }
}

async function syncPayloads() {
    const limit = document.getElementById('syncLimit').value;
    const resultDiv = document.getElementById('syncResult');
    const resultText = document.getElementById('syncResultText');

    resultDiv.classList.remove('hidden');
    resultText.textContent = 'Fetching payloads from URLhaus...';

    const data = await window.apiRequest(`/urlhaus/sync/payloads?limit=${limit}`);

    if (data) {
        if (data.success) {
            resultText.textContent = `✓ ${data.message}`;
            resultText.className = 'text-sm text-green-300';
        } else {
            resultText.textContent = `✗ ${data.message}`;
            resultText.className = 'text-sm text-red-300';
        }
    } else {
        resultText.textContent = '✗ Error fetching payloads';
        resultText.className = 'text-sm text-red-300';
    }
}

async function queryURLhaus() {
    const queryType = document.getElementById('queryType').value;
    const queryValue = document.getElementById('queryInput').value.trim();
    const resultDiv = document.getElementById('queryResult');
    const resultText = document.getElementById('queryResultText');

    if (!queryValue) {
        alert('Please enter a value to query');
        return;
    }

    resultDiv.classList.remove('hidden');
    resultText.textContent = 'Querying URLhaus...';

    const endpoints = {
        'url': '/urlhaus/query/url',
        'host': '/urlhaus/query/host',
        'tag': '/urlhaus/query/tag',
        'payload': '/urlhaus/query/payload'
    };

    const bodies = {
        'url': { url: queryValue },
        'host': { host: queryValue },
        'tag': { tag: queryValue },
        'payload': { hash: queryValue, hashType: 'sha256' }
    };

    const data = await window.apiRequest(endpoints[queryType], {
        method: 'POST',
        body: JSON.stringify(bodies[queryType])
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

async function deleteIOC(id) {
    if (!confirm('Are you sure you want to delete this IOC?')) {
        return;
    }

    const data = await window.apiRequest(`/ioc/${id}`, { method: 'DELETE' });

    if (data && data.success) {
        alert('IOC deleted successfully');
        loadIOCs();
        loadStatistics();
    } else {
        alert('Failed to delete IOC');
    }
}

document.getElementById('searchInput').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        currentPage = 1;
        loadIOCs();
    }
});

// Initialize page
if (window.checkAuth && window.checkAuth('admin')) {
    updateUserInfoDisplay();
    loadStatistics();
    loadIOCs();
}


