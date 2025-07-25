import { useCallback, useState } from 'react';
import { SubmitRequestFormData } from '../features/submitRequest/types';
import { useAuth } from './useAuth';
import { api } from '../services/api';

export interface UseNameRequestsResult {
  submitRequest: (data: SubmitRequestFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useNameRequests = (): UseNameRequestsResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const submitRequest = useCallback(
    async (formData: SubmitRequestFormData) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      setIsLoading(true);
      setError(null);

      try {
        // Prepare form data for submission
        const formDataToSend = new FormData();
        
        // Add all form fields to FormData
        Object.entries(formData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            // Handle array fields (like brandGuidelines)
            value.forEach((item) => formDataToSend.append(key, item));
          } else if (value instanceof File) {
            // Handle file uploads if needed
            formDataToSend.append(key, value);
          } else if (value !== null && value !== undefined) {
            formDataToSend.append(key, String(value));
          }
        });

        // Submit the request
        const response = await api.post('/name-requests', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to submit request');
        }

        return response.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return { submitRequest, isLoading, error };
};

export const useSubmitNameRequest = useNameRequests;
