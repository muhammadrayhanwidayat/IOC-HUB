(function () {

  const API_URL = 'http://localhost:3000/api';
  window.API_URL = API_URL;

  // --- Helpers for token & user storage ---
  const getAccessToken = () => localStorage.getItem('accessToken');
  const getRefreshToken = () => localStorage.getItem('refreshToken');
  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
      return null;
    }
  };

  const setTokens = ({ accessToken, refreshToken, user }) => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (user) {
      try {
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) { /* ignore */ }
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  // --- Token refresh ---
  async function refreshToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      // try parse json safely
      const data = await res.json().catch(() => null);
      if (data && data.success && data.data) {
        setTokens({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          user: data.data.user || getStoredUser(),
        });
        return true;
      }
    } catch (err) {
      console.error('Token refresh error:', err);
    }
    return false;
  }

  // --- Logout ---
  async function logout() {
    // attempt to call server logout (best-effort)
    try {
      const token = getAccessToken();
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } catch (e) {
      // ignore
    } finally {
      clearAuth();
      // redirect to login
      window.location.href = 'login.html';
    }
  }

  // --- Central API request wrapper ---
  async function apiRequest(endpoint, options = {}) {
    const token = getAccessToken();

    const mergedHeaders = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (token) mergedHeaders['Authorization'] = `Bearer ${token}`;

    const fetchOptions = {
      ...options,
      headers: mergedHeaders,
    };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, fetchOptions);

      // Handle 401: maybe expired token
      if (res.status === 401) {
        let body = null;
        try { body = await res.json(); } catch (e) { body = null; }

        // If token expired, try refresh and retry once
        if (body && body.code === 'TOKEN_EXPIRED') {
          const ok = await refreshToken();
          if (ok) {
            return apiRequest(endpoint, options);
          }
        }

        // otherwise logout and return null
        logout();
        return null;
      }

      // parse response body safely
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        // not JSON — return raw text
        return text;
      }
    } catch (error) {
      console.error('API request error:', error);
      return null;
    }
  }

  // --- Auth guard for pages ---
  // requiredRole: optional ('admin' to require admin)
  function checkAuth(requiredRole) {
    const token = getAccessToken();
    const user = getStoredUser();

    if (!token) {
      window.location.href = 'login.html';
      return false;
    }
    if (requiredRole && (!user || user.role !== requiredRole)) {
      // If token exists but role mismatch, redirect to login (or dashboard)
      window.location.href = 'login.html';
      return false;
    }

    // Set user info element if present
    const userInfoEl = document.getElementById('userInfo');
    if (userInfoEl && user) {
      userInfoEl.textContent = requiredRole === 'admin'
        ? `${user.username} (Admin)`
        : `${user.username} (${user.role})`;
    }
    return true;
  }

  // expose to global scope
  window.apiRequest = apiRequest;
  window.refreshToken = refreshToken;
  window.logout = logout;
  window.checkAuth = checkAuth;
  window.getAuthUser = getStoredUser;
  window.getAccessToken = getAccessToken;
})();
