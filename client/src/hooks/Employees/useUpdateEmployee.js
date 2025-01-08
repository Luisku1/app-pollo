import { useState } from "react"
import { updateEmployeeFetch } from "../../services/Employees/updateEmployee"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { getEmployeeFullName } from "../../helpers/Functions"

export const useUpdateEmployee = () => {
  const [loading, setLoading] = useState(false)

  const updateEmployee = async (employeeData) => {
    setLoading(true)
    ToastSuccess(`Empleado ${getEmployeeFullName(employeeData)} actualizado correctamente`)
    try {
      const employee = await updateEmployeeFetch(employeeData)

      return employee
    } catch (error) {
      ToastDanger(`Error al actualizar el empleado: ${error.message}`)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return { updateEmployee, loading }
}
