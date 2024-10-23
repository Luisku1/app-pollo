import { useState } from "react"
import { ToastDanger, ToastInfo, ToastSuccess } from "../../helpers/toastify"
import { addEmployeeRestFetch } from "../../services/employees/addEmployeeRest"
import { formatInformationDate } from "../../helpers/DatePickerFunctions"

export const useAddEmployeeRest = () => {

  const [loading, setLoading] = useState(false)

  const addEmployeeRest = ({ employeeRest, pushPendingEmployeeRest, splicePendingEmployeeRest, updateLastEmployeeRestId }) => {

    setLoading(true)

    ToastSuccess(`Se registró el descanso para ${employeeRest.employee.label} el día ${formatInformationDate(employeeRest.date)}`)

    if(employeeRest.replacement == null) {

      ToastInfo('El descanso no tiene a un reemplazo')
    }

    pushPendingEmployeeRest({ employeeRest })

    addEmployeeRestFetch({
      employeeId: employeeRest.employee.value,
      replacementId: employeeRest.replacement?.value,
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