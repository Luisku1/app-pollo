import { useState } from "react"
import { ToastDanger } from "../../helpers/toastify"
import { addEmployeeRestFetch } from "../../services/employees/addEmployeeRest"

export const useAddEmployeeRest = () => {

  const [loading, setLoading] = useState(false)

  const addEmployeeRest = ({ employeeRest, pushPendingEmployeeRest, splicePendingEmployeeRest, updateLastEmployeeRestId }) => {

    setLoading(true)

    pushPendingEmployeeRest({ employeeRest })

    addEmployeeRestFetch({
      employeeId: employeeRest.employee.value,
      replacementId: employeeRest.replacement.value,
      date: employeeRest.date,
      companyId: employeeRest.companyId
    }).then((response) => {

      updateLastEmployeeRestId({ createdEmployeeRestId: response.newEmployeeRest._id })

    }).catch((error) => {

      ToastDanger('No se registró el descanso')
      splicePendingEmployeeRest({ index: 0 })
      console.log(error)
    })

    setLoading(false)
  }

  return { addEmployeeRest, loading }
}