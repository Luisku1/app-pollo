import { useQuery } from '@tanstack/react-query';
import { getBranchPricesFetch } from "../../services/Prices/getBranchPrices"

export const usePricesSelector = (branchId, date, pricesDate = null, sortOrder = null) => {
  const {
    data: prices,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['branchPrices', branchId, date, pricesDate, sortOrder],
    queryFn: async () => {
      if ((!branchId || !date) || ((pricesDate && !sortOrder) || (!pricesDate && sortOrder))) {
        return [];
      }
      const response = await getBranchPricesFetch(branchId, date, pricesDate, sortOrder);
      return response.branchPrices;
    },
    enabled: !!branchId && !!date,
    staleTime: 1000 * 60 * 5
  });

  return { prices, loading, error };
}