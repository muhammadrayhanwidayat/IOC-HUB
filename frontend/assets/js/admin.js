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
      <td class="px-4 py-2 space-x-2">
  <button onclick="openEditIOC(${ioc.id})"
    class="text-yellow-400 hover:text-yellow-300 text-sm">
    Edit
  </button>
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
    
    const data = await apiRequest(`/ioc/${id}`, { method: 'DELETE' });
    
    if (data && data.success) {
        alert('IOC deleted successfully');
        loadIOCs();
        loadStatistics();
    } else {
        alert('Failed to delete IOC');
    }
}

async function createIOC() {
  const value = document.getElementById('newValue').value.trim();
  if (!value) {
    alert('URL wajib diisi');
    return;
  }

  const payload = {
    type: 'url',
    value,
    threat: document.getElementById('newThreat').value,
    status: document.getElementById('newStatus').value,
    reporter: document.getElementById('newReporter').value,
    source: 'manual'
  };

  const res = await window.apiRequest('/ioc', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (res?.success) {
    alert('IOC added');
    loadIOCs();
    loadStatistics();

    ['newValue','newThreat','newReporter']
      .forEach(id => document.getElementById(id).value = '');
  } else {
    alert('Failed to add IOC');
  }
}

function openEditIOC(id) {
  const row = [...document.querySelectorAll('#iocTable tr')]
    .find(tr => tr.innerHTML.includes(`deleteIOC(${id})`));

  document.getElementById('editId').value = id;
  document.getElementById('editThreat').value =
    row.children[2].innerText === '-' ? '' : row.children[2].innerText;
  document.getElementById('editStatus').value =
    row.children[3].innerText;
  document.getElementById('editReporter').value =
    row.children[4].innerText === '-' ? '' : row.children[4].innerText;

  document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('editModal').classList.add('hidden');
}

async function saveEditIOC() {
  const id = document.getElementById('editId').value;

  const payload = {
    threat: document.getElementById('editThreat').value,
    status: document.getElementById('editStatus').value,
    reporter: document.getElementById('editReporter').value
  };

  const res = await window.apiRequest(`/ioc/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

  if (res?.success) {
    closeEditModal();
    loadIOCs();
    loadStatistics();
    alert('IOC updated');
  } else {
    alert('Failed to update IOC');
  }
}
