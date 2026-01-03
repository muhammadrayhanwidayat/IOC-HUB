let currentPage = 1;
let totalPages = 1;

function updateUserInfoDisplay() {
  const user = window.getAuthUser?.();
  if (user) {
    document.getElementById('userInfo').textContent = `${user.username} (Admin)`;
  }
}

async function loadStatistics() {
  const data = await window.apiRequest('/ioc/stats');
  console.log('STATISTICS RESPONSE:', data);

  if (data?.success) {
    document.getElementById('totalIOCs').textContent = data.data.total;

    const urlCount =
      data.data.byType?.find(t => t.type === 'url')?.count || 0;

    document.getElementById('totalURLs').textContent = urlCount;
  }
}

async function loadIOCs() {
  const status = document.getElementById('filterStatus').value;
  const search = document.getElementById('searchInput').value;

  const params = new URLSearchParams({
    page: currentPage,
    limit: 20,
    type: 'url', // ✅ URL-only
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const data = await window.apiRequest(`/ioc?${params}`);

  if (!data?.success) return;

  const tbody = document.getElementById('iocTable');

  if (data.data.iocs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-4 py-8 text-center text-gray-400">
          No URLs found
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.data.iocs.map(ioc => `
    <tr class="hover:bg-gray-700">
      <td class="px-4 py-2">
        <span class="px-2 py-1 rounded text-xs bg-blue-900 text-blue-200">
          URL
        </span>
      </td>
      <td class="px-4 py-2 font-mono text-xs truncate" title="${ioc.value}">
        ${ioc.value}
      </td>
      <td class="px-4 py-2">${ioc.threat || '-'}</td>
      <td class="px-4 py-2">${ioc.status}</td>
      <td class="px-4 py-2">${ioc.reporter || '-'}</td>
      <td class="px-4 py-2">
        ${new Date(ioc.createdAt).toLocaleDateString()}
      </td>
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

function changePage(delta) {
  currentPage = Math.max(1, Math.min(totalPages, currentPage + delta));
  loadIOCs();
}

document.getElementById('searchInput').addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    currentPage = 1;
    loadIOCs();
  }
});

// Init
if (window.checkAuth?.('admin')) {
  updateUserInfoDisplay();
  loadStatistics();
  loadIOCs();
}




async function syncURLs() {
  const limit = document.getElementById('syncLimit').value;
  const resultDiv = document.getElementById('syncResult');
  const resultText = document.getElementById('syncResultText');

  resultDiv.classList.remove('hidden');
  resultText.textContent = 'Syncing URLs from URLhaus...';

  const data = await window.apiRequest(`/urlhaus/sync/urls?limit=${limit}`);

  if (!data) {
    resultText.textContent = '✗ Error syncing URLs';
    resultText.className = 'text-sm text-red-300';
    return;
  }

  if (data.success) {
    resultText.textContent = `✓ ${data.message}`;
    resultText.className = 'text-sm text-green-300';
    await loadIOCs();
    await loadStatistics();
  } else {
    resultText.textContent = `✗ ${data.message}`;
    resultText.className = 'text-sm text-red-300';
  }
}

async function deleteIOC(id) {
    if (!confirm('Are you sure you want to delete this IOC?')) {
        return;
    }
    
    const data = await apiRequest(`/ioc/${id}`, { method: 'DELETE' });
    
    if (data && data.success) {
        alert('IOC deleted successfully');
        loadIOCs();
        loadStatistics();
    } else {
        alert('Failed to delete IOC');
    }
}