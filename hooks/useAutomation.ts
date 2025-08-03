import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { APIAutomationPayload } from '../utils/automation-transform';

// Types for API responses
interface AutomationResponse {
  success: boolean;
  data: APIAutomationPayload & { id: string };
  message?: string;
}

interface AutomationListResponse {
  success: boolean;
  data: (APIAutomationPayload & { id: string })[];
  message?: string;
}

// API base URL - adjust this to your actual API endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Hook to save/create a new automation
 */
export function useSaveAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (automationData: APIAutomationPayload): Promise<AutomationResponse> => {
      const response = await fetch(`${API_BASE_URL}/automations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(automationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Automation saved successfully!');
      // Invalidate and refetch automation list
      queryClient.invalidateQueries({ queryKey: ['automations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to save automation: ${error.message}`);
    },
  });
}

/**
 * Hook to update an existing automation
 */
export function useUpdateAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      automationData 
    }: { 
      id: string; 
      automationData: APIAutomationPayload 
    }): Promise<AutomationResponse> => {
      const response = await fetch(`${API_BASE_URL}/automations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(automationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Automation updated successfully!');
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      queryClient.invalidateQueries({ queryKey: ['automation', data.data.id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update automation: ${error.message}`);
    },
  });
}

/**
 * Hook to load a specific automation by ID
 */
export function useGetAutomation(id: string | null) {
  return useQuery({
    queryKey: ['automation', id],
    queryFn: async (): Promise<AutomationResponse> => {
      if (!id) throw new Error('Automation ID is required');

      const response = await fetch(`${API_BASE_URL}/automations/${id}`, {
        headers: {
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!id, // Only run query if ID is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to load all automations
 */
export function useGetAutomations(filters?: {
  is_active?: boolean;
  trigger_type?: string;
  limit?: number;
  offset?: number;
}) {
  const queryParams = new URLSearchParams();
  
  if (filters?.is_active !== undefined) {
    queryParams.append('is_active', filters.is_active.toString());
  }
  if (filters?.trigger_type) {
    queryParams.append('trigger_type', filters.trigger_type);
  }
  if (filters?.limit) {
    queryParams.append('limit', filters.limit.toString());
  }
  if (filters?.offset) {
    queryParams.append('offset', filters.offset.toString());
  }

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/automations${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: ['automations', filters],
    queryFn: async (): Promise<AutomationListResponse> => {
      const response = await fetch(url, {
        headers: {
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to delete an automation
 */
export function useDeleteAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ success: boolean; message?: string }> => {
      const response = await fetch(`${API_BASE_URL}/automations/${id}`, {
        method: 'DELETE',
        headers: {
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Automation deleted successfully!');
      // Invalidate and refetch automation list
      queryClient.invalidateQueries({ queryKey: ['automations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete automation: ${error.message}`);
    },
  });
}

/**
 * Hook to toggle automation active status
 */
export function useToggleAutomationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      is_active 
    }: { 
      id: string; 
      is_active: boolean 
    }): Promise<AutomationResponse> => {
      const response = await fetch(`${API_BASE_URL}/automations/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Automation ${data.data.is_active ? 'activated' : 'deactivated'} successfully!`);
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      queryClient.invalidateQueries({ queryKey: ['automation', data.data.id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle automation status: ${error.message}`);
    },
  });
}

/**
 * Hook to test/execute an automation
 */
export function useTestAutomation() {
  return useMutation({
    mutationFn: async ({ 
      id, 
      testData 
    }: { 
      id: string; 
      testData?: Record<string, any> 
    }): Promise<{ success: boolean; result: any; message?: string }> => {
      const response = await fetch(`${API_BASE_URL}/automations/${id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ testData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Automation test completed successfully!');
      } else {
        toast.warning('Automation test completed with warnings');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to test automation: ${error.message}`);
    },
  });
}