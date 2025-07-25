import axios from 'axios';
import { NameRequest, NameRequestStatus, NameRequestType } from '../features/nameRequests/types';

// Define custom types for our API responses
type ApiResponse<T = any> = {
  data: T;
  message?: string;
};

type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

// Extend the existing axios config type
type CustomAxiosConfig = {
  _retry?: boolean;
  headers?: Record<string, string>;
  [key: string]: any;
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
  timeout: 10000, // 10 seconds
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    // Handle 401 Unauthorized (token expired, invalid, etc.)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?sessionExpired=true';
      }
    }
    
    // Handle other errors
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = <T>(response: any): T => {
  return response.data;
};

// Helper function to handle API errors
const handleError = (error: any): never => {
  if (error.response?.data) {
    const message = error.response.data.message || error.message || 'An error occurred';
    throw new Error(message);
  }
  throw error;
};

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post<{ token: string; user: any }>('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  logout: async () => {
    try {
      const response = await api.get('/auth/logout');
      localStorage.removeItem('token');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  googleAuth: () => {
    window.location.href = `${API_URL}/auth/google`;
  },
};

// Name Requests API
export const nameRequestAPI = {
  // Get all name requests with filters and pagination
  getRequests: async (params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: NameRequestStatus;
    type?: NameRequestType;
    search?: string;
    myRequests?: boolean;
  }) => {
    try {
      const response = await api.get<{ data: NameRequest[]; total: number }>('/name-requests', { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Get a single name request by ID
  getRequestById: async (id: string) => {
    try {
      const response = await api.get<NameRequest>(`/name-requests/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Create a new name request
  createRequest: async (data: Partial<NameRequest>) => {
    try {
      const formData = new FormData();
      
      // Append all fields to form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'attachments' && Array.isArray(value)) {
            // Handle file attachments
            value.forEach((file, index) => {
              if (file instanceof File) {
                formData.append('attachments', file);
              } else if (typeof file === 'string') {
                formData.append(`attachments[${index}]`, file);
              }
            });
          } else if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value as string | Blob);
          }
        }
      });
      
      const response = await api.post<NameRequest>('/name-requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Update an existing name request
  updateRequest: async (id: string, data: Partial<NameRequest>) => {
    try {
      const formData = new FormData();
      
      // Append all fields to form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'attachments' && Array.isArray(value)) {
            // Handle file attachments
            value.forEach((file, index) => {
              if (file instanceof File) {
                formData.append('attachments', file);
              } else if (typeof file === 'string') {
                formData.append(`attachments[${index}]`, file);
              }
            });
          } else if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value as string | Blob);
          }
        }
      });
      
      const response = await api.put<NameRequest>(`/name-requests/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Delete a name request
  deleteRequest: async (id: string) => {
    try {
      const response = await api.delete(`/name-requests/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Approve a name request
  approveRequest: async (id: string, data: { approvalNotes?: string }) => {
    try {
      const response = await api.post<NameRequest>(`/name-requests/${id}/approve`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Reject a name request
  rejectRequest: async (id: string, data: { rejectionReason: string }) => {
    try {
      const response = await api.post<NameRequest>(`/name-requests/${id}/reject`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Request changes for a name request
  requestChanges: async (id: string, data: { changesRequested: string }) => {
    try {
      const response = await api.post<NameRequest>(`/name-requests/${id}/request-changes`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Add a comment to a name request
  addComment: async (requestId: string, data: { text: string }) => {
    try {
      const response = await api.post(`/name-requests/${requestId}/comments`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Upload a file attachment
  uploadAttachment: async (requestId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/name-requests/${requestId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Delete a file attachment
  deleteAttachment: async (requestId: string, attachmentId: string) => {
    try {
      const response = await api.delete(`/name-requests/${requestId}/attachments/${attachmentId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

export default api;
