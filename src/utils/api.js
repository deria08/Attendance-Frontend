export const apiFetch = async (url, options = {}) => {
  const token = sessionStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    sessionStorage.removeItem('token');
    window.location.href = '/';
  }
  return response;
};