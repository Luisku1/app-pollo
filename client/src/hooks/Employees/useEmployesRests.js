import { useEffect, useMemo, useState } from "react"
import { getPendingEmployeesRestsFetch } from "../../services/employees/getPendingEmployeesRests"
import { Types } from "mongoose"
import { useAddEmployeeRest } from "./useAddEmployeeRest"
import { useDeleteEmployeeRest } from "./useDeleteEmployeeRest"

export const usePendingEmployeesRests = ({ companyId }) => {

  const [pendingRests, setPendingRests] = useState([])
  const { addEmployeeRest } = useAddEmployeeRest()
  const { deleteEmployeeRest } = useDeleteEmployeeRest()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const pushPendingEmployeeRest = (employeeRest) => {

    setPendingRests((prev) => [employeeRest, ...prev])
  }

  const splicePendingEmployeeRest = (index) => {

    setPendingRests((prev) => prev.filter((_, i) => i != index))
  }

  const onAddEmployeeRest = async (employeeRest) => {

    const tempId = new Types.ObjectId().toHexString()

    try {

      const tempEmployeeRest = { ...employeeRest, _id: tempId };
      pushPendingEmployeeRest(tempEmployeeRest);

      await addEmployeeRest(tempEmployeeRest);

    } catch (error) {

      splicePendingEmployeeRest(pendingRests.findIndex((rest) => rest._id === tempId));
      console.log(error);
    }
  };

  const onDeleteEmployeeRest = async (employeeRest, index) => {
    try {

      splicePendingEmployeeRest(index);
      await deleteEmployeeRest(employeeRest);

    } catch (error) {
      pushPendingEmployeeRest(employeeRest);
      console.log(error);
    }
  };

  useEffect(() => {

    if (!companyId) return

    setLoading(true)

    const fetchPendingEmployeesRests = async () => {
      try {
        const response = await getPendingEmployeesRestsFetch(companyId)
        setPendingRests(response.pendingEmployeesRests)
      } catch (error) {
        console.log(error)
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingEmployeesRests()

  }, [companyId])

  const sortedPendingRest = useMemo(() => {
    return pendingRests.sort((a, b) => a.createdAt - b.createdAt)
  }, [pendingRests])

  return {
    pendingRests: sortedPendingRest,
    pushPendingEmployeeRest,
    splicePendingEmployeeRest,
    onAddEmployeeRest,
    onDeleteEmployeeRest,
    loading,
    error
  }
}