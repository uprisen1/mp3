import axios from 'axios';

// Use relative API path in production, localhost in development
const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (username, password) =>
    api.post('/auth/register', { username, password }),
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
};

// Music endpoints
export const musicAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/music/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: () => api.get('/music/all'),
  delete: (id) => api.delete(`/music/${id}`),
  getStreamUrl: (id) => `${API_BASE}/music/stream/${id}`,
};

// Playlist endpoints
export const playlistAPI = {
  create: (name) => api.post('/playlist/create', { name }),
  getAll: () => api.get('/playlist'),
  getById: (id) => api.get(`/playlist/${id}`),
  addSong: (playlistId, musicId) =>
    api.post(`/playlist/${playlistId}/add`, { musicId }),
  removeSong: (playlistId, musicId) =>
    api.post(`/playlist/${playlistId}/remove`, { musicId }),
  delete: (id) => api.delete(`/playlist/${id}`),
};

export default api;
