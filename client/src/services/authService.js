import axios from 'axios';

const API_URL = '/api/auth';

const authService = {
  register: async (username, email, password) => {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      email,
      password
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });
    return response.data;
  },

  logout: async (token) => {
    const response = await axios.post(
      `${API_URL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  getProfile: async (token) => {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  updateProfile: async (token, data) => {
    const response = await axios.put(
      `${API_URL}/profile`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  changePassword: async (token, currentPassword, newPassword) => {
    const response = await axios.put(
      `${API_URL}/password`,
      { currentPassword, newPassword },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};

export default authService;
