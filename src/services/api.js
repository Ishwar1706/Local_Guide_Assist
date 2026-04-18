import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — force logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lg_token');
      localStorage.removeItem('lg_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ─────────────────────────────────────────
//  GUIDES
// ─────────────────────────────────────────
export const guidesAPI = {
  getAll: (params = {}) => api.get('/guides', { params }),
  getById: (id) => api.get(`/guides/${id}`),
  getMyProfile: () => api.get('/guides/my/profile'),
  updateMyProfile: (data) => api.put('/guides/my/profile', data),
  addReview: (guideId, data) => api.post(`/guides/${guideId}/review`, data),
  reviewTourist: (touristId, data) => api.post(`/guides/review-tourist/${touristId}`, data),
};

// ─────────────────────────────────────────
//  BOOKINGS
// ─────────────────────────────────────────
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getGuideBookings: () => api.get('/bookings/guide'),
  getAllBookings: () => api.get('/bookings/all'),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

// ─────────────────────────────────────────
//  PAYMENTS
// ─────────────────────────────────────────
export const paymentsAPI = {
  initiate: (bookingId, paymentType) => api.post('/payments/initiate', { bookingId, paymentType }),
  verify: (data) => api.post('/payments/verify', data),
};

// ─────────────────────────────────────────
//  ADMIN
// ─────────────────────────────────────────
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getStats: () => api.get('/admin/stats'),
  verifyGuide: (id) => api.patch(`/admin/guides/${id}/verify`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

// ─────────────────────────────────────────
//  CHAT
// ─────────────────────────────────────────
export const chatAPI = {
  getMyChats: () => api.get('/chat/my'),
  getBookingChat: (bookingId) => api.get(`/chat/booking/${bookingId}`),
  getDirectMessages: (otherUserId) => api.get(`/chat/direct/${otherUserId}`),
  sendMessage: (data) => api.post('/chat/send', data),
};

export default api;
