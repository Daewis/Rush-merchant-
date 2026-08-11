import axios from 'axios';
import { ApiResponse, Job, Provider, Payment, Violation, Notification, User } from '@/types';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    if (config.url) {
      config.url = config.url.replace(/\/+$/, '');
    }
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
          if (response.data?.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; access_token: string; refresh_token?: string }>>('/auth/login', data),
  register: (data: { full_name: string; email: string; phone: string; password: string; role?: string }) =>
    api.post<ApiResponse<{ user: User }>>('/auth/register', data),
  verify: (data: { email: string; code: string }) =>
    api.post<ApiResponse>('/auth/verify', data),
  resendVerification: (data: { email: string }) =>
    api.post<ApiResponse>('/auth/resend-verification', data),
  me: () =>
    api.get<ApiResponse<{ user: User }>>('/auth/me'),
  logout: () =>
    api.post<ApiResponse>('/auth/logout'),
  updateProfile: (data: any) =>
    api.put<ApiResponse<{ user: User }>>('/auth/profile', data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post<ApiResponse>('/auth/change-password', data),
  deleteAccount: () =>
    api.delete<ApiResponse>('/auth/delete-account'),
  refresh: (data: { refresh_token: string }) =>
    api.post<ApiResponse<{ access_token: string }>>('/auth/refresh', data),
};

// Job API
export const jobApi = {
  list: (params?: any) =>
    api.get<ApiResponse<{ jobs: Job[] }>>('/jobs', { params }),
  get: (id: string) =>
    api.get<ApiResponse<{ job: Job }>>(`/jobs/${id}`),
  create: (data: any) =>
    api.post<ApiResponse<{ job: Job }>>('/jobs', data),
  update: (id: string, data: any) =>
    api.put<ApiResponse<{ job: Job }>>(`/jobs/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse>(`/jobs/${id}`),
  apply: (id: string, data?: any) =>
    api.post<ApiResponse>(`/jobs/${id}/apply`, data),
  checkIn: (id: string, data?: any) =>
    api.post<ApiResponse>(`/jobs/${id}/check-in`, data),
  checkOut: (id: string, data?: any) =>
    api.post<ApiResponse>(`/jobs/${id}/check-out`, data),
  confirm: (id: string, data?: any) =>
    api.post<ApiResponse>(`/jobs/${id}/confirm`, data),
  cancel: (id: string, data?: any) =>
    api.post<ApiResponse>(`/jobs/${id}/cancel`, data),
  getMyJobs: () =>
    api.get<ApiResponse<{ jobs: Job[] }>>('/jobs/my'),
  getCustomerStats: () =>
    api.get<ApiResponse<any>>('/jobs/stats/customer'),
  getRecentDeliveries: () =>
    api.get<ApiResponse<any[]>>('/jobs/recent'),
  getWeeklySpending: () =>
    api.get<ApiResponse<{ label: string; value: number }[]>>('/jobs/spending/weekly'),
  getProviderStats: () =>
    api.get<ApiResponse<any>>('/jobs/stats/provider'),
  getAvailableJobs: () =>
    api.get<ApiResponse<any[]>>('/jobs/available'),
  getDailyEarnings: () =>
    api.get<ApiResponse<{ label: string; value: number }[]>>('/jobs/earnings/daily'),
};

// Provider API
export const providerApi = {
  list: (params?: any) =>
    api.get<ApiResponse<{ providers: Provider[] }>>('/providers', { params }),
  search: (params?: any) =>
    api.get<ApiResponse<{ providers: Provider[] }>>('/providers', { params }),
  get: (id: string) =>
    api.get<ApiResponse<{ provider: Provider }>>(`/providers/${id}`),
  getMe: () =>
    api.get<ApiResponse<{ provider: Provider }>>('/providers/me'),
  register: (data: any) =>
    api.post<ApiResponse<{ provider: Provider }>>('/providers/register', data),
  update: (data: any) =>
    api.put<ApiResponse<{ provider: Provider }>>('/providers/me', data),
  verify: (data: any) =>
    api.post<ApiResponse>('/providers/verify', data),
  availability: (data: any) =>
    api.put<ApiResponse>('/providers/availability', data),
  stats: () =>
    api.get<ApiResponse>('/providers/stats'),
};

// Payment API
export const paymentApi = {
  list: (params?: any) =>
    api.get<ApiResponse<{ payments: Payment[] }>>('/payments', { params }),
  me: (params?: any) =>
    api.get<ApiResponse<{ payments: Payment[] }>>('/payments', { params }),
  get: (id: string) =>
    api.get<ApiResponse<{ payment: Payment }>>(`/payments/${id}`),
  create: (data: any) =>
    api.post<ApiResponse<{ payment: Payment }>>('/payments', data),
  initialize: (data: any) =>
    api.post<ApiResponse<any>>('/payments', data),
  initializePaystack: (data: { amount: number; email?: string; job_id?: string; payment_type?: string; callback_url?: string }) =>
    api.post<ApiResponse<{ authorization_url: string; access_code: string; reference: string; public_key?: string }>>('/payments/paystack/initialize', data),
  verifyPaystack: (data: { reference: string }) =>
    api.post<ApiResponse<any>>('/payments/paystack/verify', data),
  verify: (data: { reference: string }) =>
    api.post<ApiResponse>('/payments/verify', data),
  job: (jobId: string) =>
    api.get<ApiResponse<{ payments: Payment[] }>>('/payments', { params: { job_id: jobId } }),
};

// Rating API
export const ratingApi = {
  create: (data: any) =>
    api.post<ApiResponse<{ rating: any }>>('/ratings', data),
  getForTarget: (targetId: string) =>
    api.get<ApiResponse<{ ratings: any[] }>>(`/ratings/target/${targetId}`),
};

// Notification API
export const notificationApi = {
  list: (params?: any) =>
    api.get<ApiResponse<{ notifications: Notification[] }>>('/notifications', { params }),
  unreadCount: () =>
    api.get<ApiResponse<any>>('/notifications/unread-count'),
  markAsRead: (id: string) =>
    api.put<ApiResponse>(`/notifications/${id}/read`),
  markRead: (id: string) =>
    api.put<ApiResponse>(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.put<ApiResponse>('/notifications/read-all'),
  markAllRead: () =>
    api.put<ApiResponse>('/notifications/read-all'),
  delete: (id: string) =>
    api.delete<ApiResponse>(`/notifications/${id}`),
  deleteAll: () =>
    api.delete<ApiResponse>('/notifications'),
};

// Violation API
export const violationApi = {
  list: (params?: any) =>
    api.get<ApiResponse<{ violations: Violation[] }>>('/violations', { params }),
  my: (params?: any) =>
    api.get<ApiResponse<{ violations: Violation[] }>>('/violations', { params }),
  create: (data: any) =>
    api.post<ApiResponse<{ violation: Violation }>>('/violations', data),
  report: (data: any) =>
    api.post<ApiResponse<{ violation: Violation }>>('/violations', data),
  get: (id: string) =>
    api.get<ApiResponse<{ violation: Violation }>>(`/violations/${id}`),
  appeal: (id: string, data: any) =>
    api.post<ApiResponse>(`/violations/${id}/appeal`, data),
  stats: () =>
    api.get<ApiResponse>('/violations/stats'),
};

// Admin API
export const adminApi = {
  getMetrics: () =>
    api.get<ApiResponse<any>>('/admin/metrics'),
  getRegionStats: () =>
    api.get<ApiResponse<{ label: string; value: number }[]>>('/admin/regions'),
  getSystemLogs: () =>
    api.get<ApiResponse<any[]>>('/admin/logs'),
  getRevenueData: () =>
    api.get<ApiResponse<{ label: string; value: number }[]>>('/admin/revenue'),
};

// User API
export const userApi = {
  getProfileStats: () =>
    api.get<ApiResponse<any>>('/users/stats'),
  updateProfile: (data: any) =>
    api.put<ApiResponse<{ user: User }>>('/users/profile', data),
  getSecuritySettings: () =>
    api.get<ApiResponse<any>>('/users/security'),
  updatePreferences: (data: any) =>
    api.put<ApiResponse>('/users/preferences', data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post<ApiResponse>('/users/change-password', data),
};

export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

export default api;
