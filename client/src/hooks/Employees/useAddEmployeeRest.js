import { useState } from "react"
import { ToastDanger, ToastInfo, ToastSuccess } from "../../helpers/toastify"
import { addEmployeeRestFetch } from "../../services/employees/addEmployeeRest"
import { formatInformationDate } from "../../helpers/DatePickerFunctions"
import { getEmployeeFullName } from "../../helpers/Functions"

export const useAddEmployeeRest = () => {

  const [loading, setLoading] = useState(false)

  const addEmployeeRest = async (employeeRest) => {

    setLoading(true)

    ToastSuccess(`Se registró el descanso para ${getEmployeeFullName(employeeRest.employee)} el día ${formatInformationDate(employeeRest.date)}`)

    if(employeeRest.replacement == null) {

      ToastInfo('El descanso no tiene a un reemplazo')
    }

    try {
      await addEmployeeRestFetch({
        _id: employeeRest._id,
        employeeId: employeeRest.employee._id,
        replacementId: employeeRest.replacement?._id,
        date: employeeRest.date,
        companyId: employeeRest.companyId
      })
    } catch (error) {
      if(error.message.includes('duplicate')) {
        ToastInfo('Este empleado ya tiene un descanso para esa fecha')
      } else {
        ToastDanger('No se pudo registrar el descanso, inténtalo de nuevo.')
      }
      console.log(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { addEmployeeRest, loading }
}