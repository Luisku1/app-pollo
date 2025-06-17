// Hook para consumir y filtrar la diferencia neta de movimientos
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getNetDifference } from '../../services/BranchMovements/getNetDifference';

export function useNetDifference({ companyId, date }) {
  const [filter, setFilter] = useState({ type: 'employee', id: null }); // type: 'employee' | 'product'
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['netDifference', companyId, date],
    queryFn: () => getNetDifference({ companyId, date }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 30, // 30 minutos
  });

  // Filtrado dinámico (memoizado)
  const filtered = useMemo(() => {
    if (!data) return null;
    if (filter.type === 'employee' && filter.id) {
      return data.byEmployee[filter.id];
    } else if (filter.type === 'product' && filter.id) {
      return data.byProduct[filter.id];
    } else {
      return data;
    }
  }, [data, filter]);

  // Para optimistic update: queryClient.setQueryData(['netDifference', companyId, date], updater)

  return { data, filtered, loading, error, filter, setFilter, refetch, queryClient };
}
