import { useQuery } from '@tanstack/react-query'
import { getProductsFetch } from "../../services/Products/getProducts"

export const PRODUCTS_QUERY_KEY = (companyId) => ['products', companyId]

export const useProducts = ({ companyId }) => {
  const queryKey = PRODUCTS_QUERY_KEY(companyId)

  const {
    data: products,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getProductsFetch(companyId),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5, // 5 minutos, ajustable
  })

  return { products, error, loading, refetch }
}