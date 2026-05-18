const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = {
  async get(endpoint, token) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network response was not ok' }));
      const error = new Error(errorData.error || 'Request failed');
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network response was not ok' }));
      const error = new Error(errorData.error || 'Request failed');
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    return response.json();
  },

  async put(endpoint, data, token) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `Server error (${response.status})` };
      }
      const error = new Error(errorData.error || errorData.message || `Request failed (${response.status})`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    return response.json();
  }
};

export default api;
