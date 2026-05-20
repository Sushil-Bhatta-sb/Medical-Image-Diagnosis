import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';

export const useHistory = () => {
  const { data: predictions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['predictions', 'history'],
    queryFn: async () => {
      const response = await apiClient.get('/predictions/history/');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });

  return {
    predictions,
    isLoading,
    error,
    refetch,
  };
};
