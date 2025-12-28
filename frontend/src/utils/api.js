import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_CLOUD_FUNCTIONS_URL;

// Get auth token for API calls
const getAuthToken = async () => {
  const { auth } = await import('../config/firebase');
  return auth.currentUser?.getIdToken();
};

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const processReport = async (fileUrl, userId) => {
  const response = await api.post('/processReport', {
    pdfUri: fileUrl,
    userId
  });
  return response.data;
};

export const analyzeReport = async (reportId) => {
  const response = await api.post('/analyzeReport', { reportId });
  return response.data;
};

export const getTrends = async (userId, testName) => {
  const response = await api.post('/getTrends', { userId, testName });
  return response.data;
};

export const compareReports = async (reportIds) => {
  const response = await api.post('/compareReports', { reportIds });
  return response.data;
};

export default api;

