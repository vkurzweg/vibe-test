import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NameRequest, NameRequestStatus, NameRequestType } from './types';
import api from '../../services/api';

interface NameRequestState {
  nameRequests: NameRequest[];
  currentRequest: NameRequest | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  filters: {
    status: NameRequestStatus | 'all';
    type: NameRequestType | 'all';
    search: string;
    myRequests: boolean;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const initialState: NameRequestState = {
  nameRequests: [],
  currentRequest: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  filters: {
    status: 'all',
    type: 'all',
    search: '',
    myRequests: false,
  },
  sortBy: '',
  sortOrder: 'asc',
};

// Async thunks
export const fetchNameRequests = createAsyncThunk(
  'nameRequests/fetchAll',
  async (params: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    status?: NameRequestStatus | 'all';
    type?: NameRequestType | 'all';
    search?: string;
    myRequests?: boolean;
  }, { rejectWithValue }) => {
    try {
      const { page, limit, sortBy, sortOrder, status, type, search, myRequests } = params;
      const response = await api.get('/name-requests', {
        params: {
          page,
          limit,
          sortBy,
          sortOrder,
          status: status === 'all' ? undefined : status,
          type: type === 'all' ? undefined : type,
          search: search || undefined,
          myRequests
        }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch name requests');
    }
  }
);

export const fetchNameRequestById = createAsyncThunk(
  'nameRequests/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/name-requests/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch name request');
    }
  }
);

export const createNameRequest = createAsyncThunk(
  'nameRequests/create',
  async (data: Partial<NameRequest>, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'attachments' && Array.isArray(value)) {
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
      
      const response = await api.post('/name-requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create name request');
    }
  }
);

export const updateNameRequest = createAsyncThunk(
  'nameRequests/update',
  async ({ id, data }: { id: string; data: Partial<NameRequest> }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'attachments' && Array.isArray(value)) {
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
      
      const response = await api.put(`/name-requests/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update name request');
    }
  }
);

export const deleteNameRequest = createAsyncThunk(
  'nameRequests/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/name-requests/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete name request');
    }
  }
);

export const approveNameRequest = createAsyncThunk(
  'nameRequests/approve',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/name-requests/${id}/approve`, { status: NameRequestStatus.APPROVED });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve name request');
    }
  }
);

export const rejectNameRequest = createAsyncThunk(
  'nameRequests/reject',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/name-requests/${id}/reject`, { 
        rejectionReason: reason 
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject name request');
    }
  }
);

export const requestChangesNameRequest = createAsyncThunk(
  'nameRequests/requestChanges',
  async ({ id, changes }: { id: string; changes: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/name-requests/${id}/request-changes`, { 
        changesRequested: changes 
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request changes for name request');
    }
  }
);

const nameRequestSlice = createSlice({
  name: 'nameRequests',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<NameRequestState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to first page when filters change
    },
    resetFilters(state) {
      state.filters = initialState.filters;
      state.page = 1;
      state.sortBy = initialState.sortBy;
      state.sortOrder = initialState.sortOrder;
    },
    clearCurrentRequest(state) {
      state.currentRequest = null;
    },
    setSort(state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    setPagination(state, action: PayloadAction<{ page: number; limit: number }>) {
      state.page = action.payload.page;
      state.limit = action.payload.limit;
    }
  },
  extraReducers: (builder) => {
    // Fetch all name requests
    builder
      .addCase(fetchNameRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNameRequests.fulfilled, (state, action: PayloadAction<{
        data: NameRequest[];
        total: number;
        page: number;
      }>) => {
        state.loading = false;
        state.nameRequests = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchNameRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch name requests';
      });

    // Fetch single name request by ID
    builder
      .addCase(fetchNameRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNameRequestById.fulfilled, (state, action: PayloadAction<NameRequest>) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(fetchNameRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch name request';
      });

    // Create name request
    builder
      .addCase(createNameRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNameRequest.fulfilled, (state, action: PayloadAction<NameRequest>) => {
        state.loading = false;
        state.nameRequests.unshift(action.payload);
        if (state.currentRequest) {
          state.currentRequest = action.payload;
        }
      })
      .addCase(createNameRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create name request';
      });

    // Update name request
    builder
      .addCase(updateNameRequest.fulfilled, (state, action: PayloadAction<NameRequest>) => {
        state.loading = false;
        const index = state.nameRequests.findIndex(req => req.id === action.payload.id);
        if (index !== -1) {
          state.nameRequests[index] = action.payload;
        }
        if (state.currentRequest?.id === action.payload.id) {
          state.currentRequest = action.payload;
        }
      })
      .addCase(updateNameRequest.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to update name request';
      });

    // Delete name request
    builder
      .addCase(deleteNameRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNameRequest.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.nameRequests = state.nameRequests.filter(req => req.id !== action.payload);
        if (state.currentRequest?.id === action.payload) {
          state.currentRequest = null;
        }
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteNameRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete name request';
      });

    // Approve name request
    builder
      .addCase(approveNameRequest.fulfilled, (state, action: PayloadAction<NameRequest>) => {
        state.loading = false;
        const index = state.nameRequests.findIndex(req => req.id === action.payload.id);
        if (index !== -1) {
          state.nameRequests[index] = action.payload;
        }
        if (state.currentRequest?.id === action.payload.id) {
          state.currentRequest = action.payload;
        }
      })
      .addCase(approveNameRequest.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to approve name request';
      });

    // Reject name request
    builder
      .addCase(rejectNameRequest.fulfilled, (state, action: PayloadAction<NameRequest>) => {
        state.loading = false;
        const index = state.nameRequests.findIndex(req => req.id === action.payload.id);
        if (index !== -1) {
          state.nameRequests[index] = action.payload;
        }
        if (state.currentRequest?.id === action.payload.id) {
          state.currentRequest = action.payload;
        }
      })
      .addCase(rejectNameRequest.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to reject name request';
      });

    // Request changes for name request
    builder
      .addCase(requestChangesNameRequest.fulfilled, (state, action) => {
        const index = state.nameRequests.findIndex(req => req._id === action.payload._id);
        if (index !== -1) {
          state.nameRequests[index] = action.payload;
        }
        if (state.currentRequest?._id === action.payload._id) {
          state.currentRequest = action.payload;
        }
      })
      .addCase(requestChangesNameRequest.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to request changes for name request';
      });
  },
});

export const { 
  setFilters, 
  resetFilters, 
  clearCurrentRequest, 
  setSort, 
  setPagination 
} = nameRequestSlice.actions;

export default nameRequestSlice.reducer;
