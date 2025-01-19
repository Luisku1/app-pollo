import { useState } from "react"
import { deleteEmployeeRestFetch } from "../../services/employees/deleteEmployeeRest"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useDeleteEmployeeRest = () => {

  const [loading, setLoading] = useState(false)

  const deleteEmployeeRest = async (employeeRest) => {

    setLoading(true)
    ToastSuccess('Descanso cancelado')

    try {
      await deleteEmployeeRestFetch(employeeRest._id)
    } catch (error) {
      ToastDanger('No se pudo cancelar el descanso, inténtalo de nuevo.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { deleteEmployeeRest, loading }
}