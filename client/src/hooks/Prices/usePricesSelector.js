import { useQuery } from '@tanstack/react-query';
import { getBranchPricesFetch } from "../../services/Prices/getBranchPrices"

export const usePricesSelector = (branchId, date, pricesDate = null, sortOrder = null, showResiduals = false) => {
  const {
    data: prices,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['branchPrices', branchId, date, pricesDate, sortOrder, showResiduals],
    queryFn: async () => {
      if ((!branchId || !date) || ((pricesDate && !sortOrder) || (!pricesDate && sortOrder))) {
        return [];
      }
      const response = await getBranchPricesFetch(branchId, date, pricesDate, sortOrder, showResiduals);
      return response.branchPrices;
    },
    enabled: !!branchId && !!date,
    staleTime: 0
  });

  console.log(showResiduals)

  return { prices, loading, error };
}