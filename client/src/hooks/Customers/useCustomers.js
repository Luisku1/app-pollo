import { useQuery } from '@tanstack/react-query'
import { getCustomersNameList } from "../../services/customers/customersNameList"

export const CUSTOMERS_QUERY_KEY = (companyId) => ['customers', companyId]

export const useCustomers = ({ companyId }) => {
  const queryKey = CUSTOMERS_QUERY_KEY(companyId)

  const {
    data: customers,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getCustomersNameList({ companyId }),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  return { customers, error, loading, refetch }
}