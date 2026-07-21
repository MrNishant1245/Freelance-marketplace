import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Request interceptor: attach access token ─────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccess();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: auto-refresh on 401 ───────────────────────────────
let isRefreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefresh);

        refreshQueue.forEach(({ resolve }) => resolve(accessToken));
        refreshQueue = [];

        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshError) {
        refreshQueue.forEach(({ reject }) => reject(refreshError));
        refreshQueue = [];
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register:             (data)            => api.post('/auth/register', data),
  login:                (data)            => api.post('/auth/login', data),
  logout:               (refreshToken)    => api.post('/auth/logout', { refreshToken }),
  getMe:                ()                => api.get('/auth/me'),
  verifyEmail:          (token)           => api.get(`/auth/verify-email/${token}`),
  resendVerification:   ()                => api.post('/auth/resend-verification'),
  forgotPassword:       (email)           => api.post('/auth/forgot-password', { email }),
  resetPassword:        (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  changePassword:       (data)            => api.put('/auth/change-password', data),
  refreshToken:         (token)           => api.post('/auth/refresh-token', { refreshToken: token }),
};

// ─── Profile API ──────────────────────────────────────────────────────────────
export const profileAPI = {
  getProfile:             (userId)       => api.get(`/profile/${userId}`),
  getFreelancersList:     ()             => api.get('/profile/list/freelancers'),
  updateProfile:          (data)         => api.put('/profile', data),
  updateFreelancerProfile:(data)         => api.put('/profile/freelancer', data),
  updateClientProfile:    (data)         => api.put('/profile/client', data),
  uploadPhoto:            (formData)     => api.post('/profile/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadProfilePhoto:     (formData)     => api.post('/profile/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadFile:             (formData)     => api.post('/profile/upload-file', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  addPortfolioItem:       (data)         => api.post('/profile/portfolio', data),
  updatePortfolioItem:    (itemId, data) => api.put(`/profile/portfolio/${itemId}`, data),
  deletePortfolioItem:    (itemId)       => api.delete(`/profile/portfolio/${itemId}`),
};

// ─── Job API ──────────────────────────────────────────────────────────────────
export const jobAPI = {
  getJobs:              (params)           => api.get('/jobs', { params }),
  getJobById:           (id)               => api.get(`/jobs/${id}`),
  createJob:            (data)             => api.post('/jobs', data),
  getMyPostedJobs:      ()                 => api.get('/jobs/my/posted'),
  updateJob:            (id, data)         => api.put(`/jobs/${id}`, data),
  deleteJob:            (id)               => api.delete(`/jobs/${id}`),
  getMyAssignedJobs:    ()                 => api.get('/jobs/my/assigned'),
  submitProposal:       (jobId, data)      => api.post(`/jobs/${jobId}/proposals`, data),
  markJobSubmitted:     (jobId, data)      => api.put(`/jobs/${jobId}/submit`, data),
  getSavedJobs:         ()                 => api.get('/jobs/saved'),
  toggleSaveJob:        (jobId)            => api.post(`/jobs/${jobId}/save`),
  updateProposalStatus: (jobId, proposalId, status) =>
    api.put(`/jobs/${jobId}/proposals/${proposalId}`, { status }),
  markJobCompleted:     (jobId)            => api.put(`/jobs/${jobId}/complete`),
  updateMilestones:     (jobId, milestones) => api.put(`/jobs/${jobId}/milestones`, { milestones }),
  fundMilestone:        (jobId, milestoneId) => api.post(`/jobs/${jobId}/milestones/${milestoneId}/fund`),
  releaseMilestone:     (jobId, milestoneId) => api.post(`/jobs/${jobId}/milestones/${milestoneId}/release`),
  raiseMilestoneDispute: (jobId, milestoneId, reason) => api.post(`/jobs/${jobId}/milestones/${milestoneId}/dispute`, { reason }),
};

// ─── Message API ✅ NEW ───────────────────────────────────────────────────────
export const messageAPI = {
  getConversations:  ()             => api.get('/messages'),
  startConversation: (data)        => api.post('/messages/start', data),
  getUnreadCount:    ()             => api.get('/messages/unread'),
  getMessages:       (convId, page) => api.get(`/messages/${convId}?page=${page || 1}&limit=50`),
  sendMessage:       (convId, body) => api.post(`/messages/${convId}`, body),
  deleteMessage:     (msgId)        => api.delete(`/messages/msg/${msgId}`),
};

// ─── Payment API ──────────────────────────────────────────────────────────────
export const paymentAPI = {
  createRazorpayOrder:   (data)          => api.post('/payment/razorpay/order', data),
  verifyRazorpayPayment: (data)          => api.post('/payment/razorpay/verify', data),
  createStripeIntent:    (data)          => api.post('/payment/stripe/intent', data),
  releasePayment:        (transactionId) => api.post('/payment/release', { transactionId }),
  refundPayment:         (transactionId) => api.post('/payment/refund',  { transactionId }),
  getHistory:            (role, page)    => api.get(`/payment/history?role=${role}&page=${page || 1}&limit=10`),
  getTransaction:        (id)            => api.get(`/payment/${id}`),
};

// ─── Review API ───────────────────────────────────────────────────────────────
export const reviewAPI = {
  submitReview:          (data)   => api.post('/reviews', data),
  getUserReviews:        (userId) => api.get(`/reviews/user/${userId}`),
  getMyWrittenReviews:   ()       => api.get('/reviews/my-written'),
  getReviewStatusForJob: (jobId)  => api.get(`/reviews/job/${jobId}/status`),
};

export default api;
