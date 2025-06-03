import { useQuery } from '@tanstack/react-query';
import { getProviders } from '../../services/Providers/getProviders';

export const useProviders = (companyId) => {
  const {
    data: providers,
    isLoading: loading,
    error,
    refetch: refetchProviders
  } = useQuery({
    queryKey: ['providers', companyId],
    queryFn: () => getProviders(companyId),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 3
  });

  return {
    providers: providers || [],
    loading,
    error,
    refetchProviders
  };
};
