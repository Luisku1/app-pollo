import { useQuery } from '@tanstack/react-query'
import { getBranchesNameList } from "../../services/branches/branchesNameList"

export const BRANCHES_QUERY_KEY = (companyId) => ['branches', companyId]

export const useBranches = ({ companyId }) => {
  const queryKey = BRANCHES_QUERY_KEY(companyId)

  const setFormula = (branchId, formula) => {

  }


  const {
    data: branches,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getBranchesNameList({ companyId }),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  return { branches, loading, error, refetch }
}