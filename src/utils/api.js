const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const api = {
  async get(endpoint, token) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  async post(endpoint, data, token) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }
};

export default api;
