let currentPage = 1;
let totalPages = 1;

function updateUserInfoDisplay() {
  const user = window.getAuthUser?.();
  if (user) {
    document.getElementById('userInfo').textContent =
      `${user.username} (${user.role})`;
  }
}

async function loadStatistics() {
  const data = await window.apiRequest('/ioc/stats');
  if (!data?.success) return;

  document.getElementById('totalIOCs').textContent = data.data.total;

  const urlCount =
    data.data.byType?.find(t => t.type === 'url')?.count || 0;

  document.getElementById('totalURLs').textContent = urlCount;
}

async function loadIOCs() {
  const search = document.getElementById('searchInput')?.value || '';

  const params = new URLSearchParams({
    page: currentPage,
    limit: 20,
    type: 'url',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  if (search) params.append('search', search);

  const data = await window.apiRequest(`/ioc?${params}`);
  if (!data?.success) return;

  const tbody = document.getElementById('iocTable');

  if (!data.data.iocs.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center py-6 text-gray-400">
          ✅ URL tidak ditemukan / URL aman
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.data.iocs.map(ioc => `
    <tr class="hover:bg-gray-700">
      <td class="px-4 py-2 font-mono text-sm break-all">${ioc.value}</td>
      <td class="px-4 py-2">${ioc.status}</td>
      <td class="px-4 py-2">
        ${new Date(ioc.createdAt).toLocaleDateString()}
      </td>
    </tr>
  `).join('');

  totalPages = data.data.pagination.totalPages;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}



function searchIOCs() {
  currentPage = 1;
  loadIOCs();
}


function changePage(delta) {
  currentPage = Math.max(1, Math.min(totalPages, currentPage + delta));
  loadIOCs();
}

async function queryURLhaus() {
  const query = document.getElementById('queryInput').value.trim();
  const container = document.getElementById('queryResult');
  const content = document.getElementById('queryResultContent');

  if (!query) {
    alert('Masukkan URL terlebih dahulu');
    return;
  }

  container.classList.remove('hidden');
  content.innerHTML = 'Querying URLhaus...';

  const data = await window.apiRequest('/urlhaus/query/url', {
    method: 'POST',
    body: JSON.stringify({ url: query })
  });

  if (!data || !data.success) {
    content.innerHTML = `<span class="text-red-400">Query gagal</span>`;
    return;
  }

  const ioc = data.data;

  // 🔥 Render hasil query sebagai CARD
  content.innerHTML = `
    <div class="space-y-2 text-sm">
      <div><span class="text-gray-400">URL:</span>
        <span class="font-mono break-all">${ioc.value}</span>
      </div>

      <div><span class="text-gray-400">Status:</span>
        <span class="${
          ioc.status === 'online' ? 'text-red-400' : 'text-gray-300'
        }">${ioc.status}</span>
      </div>

      <div><span class="text-gray-400">Threat:</span>
        ${ioc.threat || '-'}
      </div>

      <div><span class="text-gray-400">Reporter:</span>
        ${ioc.reporter || '-'}
      </div>

      <div><span class="text-gray-400">Source:</span>
        ${ioc.source}
      </div>

      ${
        ioc.urlhaus_reference
          ? `<div>
              <a href="${ioc.urlhaus_reference}"
                 target="_blank"
                 class="text-blue-400 underline">
                View on URLhaus
              </a>
            </div>`
          : ''
      }

      <div class="text-xs text-gray-500 mt-2">
      </div>
    </div>
  `;
}

document.getElementById('searchInput')?.addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    searchIOCs();
  }
});


if (window.checkAuth?.()) {
  updateUserInfoDisplay();
  loadStatistics();
  loadIOCs();
}
