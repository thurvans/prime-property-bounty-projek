const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');
let csrfToken = null;

export function setCsrfToken(token) {
  csrfToken = token || null;
}

export function clearCsrfToken() {
  csrfToken = null;
}

export function getCsrfToken() {
  return csrfToken;
}

export async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  const headers = {
    ...(options.headers || {})
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (mutating && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const apiPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${API_BASE}${apiPath}`, {
    method,
    credentials: 'include',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) clearCsrfToken();
    const error = new Error(data.message || 'Request gagal.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  if (data.csrfToken) {
    setCsrfToken(data.csrfToken);
  }

  return data;
}
