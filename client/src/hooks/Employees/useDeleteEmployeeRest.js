import { useState } from "react"
import { deleteEmployeeRestFetch } from "../../services/employees/deleteEmployeeRest"
import { ToastDanger } from "../../helpers/toastify"

export const useDeleteEmployeeRest = () => {

  const [loading, setLoading] = useState(false)

  const deleteEmployeeRest = (employeeRest, index, spliceEmployeeRest) => {

    setLoading(true)

    spliceEmployeeRest({ index })

    deleteEmployeeRestFetch({ employeeRestId: employeeRest._id }).catch((error) => {

      ToastDanger(error.message)
    })

    setLoading(false)
  }

  return { deleteEmployeeRest, loading }
}