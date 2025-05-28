import { useMemo } from "react"
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPendingEmployeesRestsFetch } from "../../services/employees/getPendingEmployeesRests"
import { Types } from "mongoose"
import { useAddEmployeeRest } from "./useAddEmployeeRest"
import { useDeleteEmployeeRest } from "./useDeleteEmployeeRest"

export const usePendingEmployeesRests = ({ companyId }) => {
  const queryClient = useQueryClient();
  const { addEmployeeRest } = useAddEmployeeRest();
  const { deleteEmployeeRest } = useDeleteEmployeeRest();

  // React Query para obtener los rests pendientes
  const {
    data: pendingRestsData = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["pendingEmployeesRests", companyId],
    queryFn: () => getPendingEmployeesRestsFetch(companyId).then(res => res.pendingEmployeesRests),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 3
  });

  // Mutación optimista para agregar un descanso pendiente
  const onAddEmployeeRest = async (employeeRest) => {
    const tempId = new Types.ObjectId().toHexString();
    const tempEmployeeRest = { ...employeeRest, _id: tempId };
    // Guardar snapshot para rollback
    const prevRests = queryClient.getQueryData(["pendingEmployeesRests", companyId]);
    queryClient.setQueryData(["pendingEmployeesRests", companyId], (old = []) => [tempEmployeeRest, ...old]);
    try {
      await addEmployeeRest(tempEmployeeRest);
    } catch (error) {
      // Rollback si hay error
      queryClient.setQueryData(["pendingEmployeesRests", companyId], prevRests);
      throw error;
    }
  };

  // Mutación optimista para eliminar un descanso pendiente
  const onDeleteEmployeeRest = async (employeeRest, index) => {
    const prevRests = queryClient.getQueryData(["pendingEmployeesRests", companyId]);
    queryClient.setQueryData(["pendingEmployeesRests", companyId], (old = []) => old.filter((_, i) => i !== index));
    try {
      await deleteEmployeeRest(employeeRest);
    } catch (error) {
      // Rollback si hay error
      queryClient.setQueryData(["pendingEmployeesRests", companyId], prevRests);
      throw error;
    }
  };

  const sortedPendingRest = useMemo(() => {
    return [...(pendingRestsData || [])].sort((a, b) => a.createdAt - b.createdAt)
  }, [pendingRestsData])

  return {
    pendingRests: sortedPendingRest,
    onAddEmployeeRest,
    onDeleteEmployeeRest,
    loading,
    error
  }
}