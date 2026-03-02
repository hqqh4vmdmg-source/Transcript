import axios from 'axios';

const API_URL = '/api/transcripts';

const transcriptService = {
  createTranscript: async (token, type, data) => {
    const response = await axios.post(
      API_URL,
      { type, data },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  getTranscripts: async (token, { type, search, sort } = {}) => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await axios.get(`${API_URL}${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  getTranscript: async (token, id) => {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  updateTranscript: async (token, id, type, data) => {
    const response = await axios.put(
      `${API_URL}/${id}`,
      { type, data },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  deleteTranscript: async (token, id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  downloadPDF: async (token, id, sealId = null) => {
    const query = sealId ? `?seal_id=${encodeURIComponent(sealId)}` : '';
    const response = await axios.get(`${API_URL}/${id}/pdf${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transcript-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  duplicateTranscript: async (token, id) => {
    const response = await axios.post(
      `${API_URL}/${id}/duplicate`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};

export default transcriptService;
