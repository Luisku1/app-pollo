import { useState } from "react"
import { deleteEmployeeFetch } from "../../services/employees/deleteEmployee"
import { ToastSuccess } from "../../helpers/toastify"

export const useDeleteEmployee = () => {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteEmployee = ({employeeId, spliceEmployee}) => {

    setLoading(true)


    deleteEmployeeFetch({employeeId}).then(() => {

      ToastSuccess('Empleado borrado correctamente')
      spliceEmployee({employeeId})

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)
  }

  return {deleteEmployee, loading, error}
}