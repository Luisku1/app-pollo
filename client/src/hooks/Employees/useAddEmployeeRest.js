import { useState } from "react"
import { ToastDanger, ToastInfo, ToastSuccess } from "../../helpers/toastify"
import { addEmployeeRestFetch } from "../../services/employees/addEmployeeRest"
import { formatInformationDate } from "../../helpers/DatePickerFunctions"
import { getEmployeeFullName } from "../../helpers/Functions"

export const useAddEmployeeRest = () => {

  const [loading, setLoading] = useState(false)

  const addEmployeeRest = ({ employeeRest, pushPendingEmployeeRest, splicePendingEmployeeRest, updateLastEmployeeRestId }) => {

    setLoading(true)

    ToastSuccess(`Se registró el descanso para ${getEmployeeFullName(employeeRest.employee)} el día ${formatInformationDate(employeeRest.date)}`)

    if(employeeRest.replacement == null) {

      ToastInfo('El descanso no tiene a un reemplazo')
    }

    pushPendingEmployeeRest({ employeeRest })

    addEmployeeRestFetch({
      employeeId: employeeRest.employee._id,
      replacementId: employeeRest.replacement?._id,
      date: employeeRest.date,
      companyId: employeeRest.companyId
    }).then((response) => {

      updateLastEmployeeRestId({ createdEmployeeRestId: response.newEmployeeRest._id })

    }).catch((error) => {

      if(error.message.includes('duplicate')) {

        ToastDanger('Este empleado ya tiene un descanso para esa fecha')

      } else {

        ToastDanger('No se pudo registrar el descanso, inténtalo de nuevo.')
      }

      splicePendingEmployeeRest({ index: 0 })
      console.log(error)
    })

    setLoading(false)
  }

  return { addEmployeeRest, loading }
}