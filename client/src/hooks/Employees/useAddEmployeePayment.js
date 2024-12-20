import { useState } from "react"
import { getEmployeeFullName, stringToCurrency } from "../../helpers/Functions"
import { ToastSuccess } from "../../helpers/toastify"
import { addEmployeePaymentFetch } from "../../services/employees/addEmployeePayment"

export const useAddEmployeePayment = () => {

  const [loading, setLoading] = useState(false)

  const addEmployeePayment = ({ employeePayment, pushEmployeePayment, pushIncome, pushExtraOutgoing, spliceEmployeePayment, updateLastEmployeePayment }) => {

    setLoading(true)
    pushEmployeePayment({ employeePayment })

    ToastSuccess(`Se registró el pago a ${getEmployeeFullName(employeePayment)} por ${stringToCurrency({ amount: employeePayment.amount })}`)

    addEmployeePaymentFetch({
      employeePayment: {
        amount: employeePayment.amount,
        detail: employeePayment.detail,
        company: employeePayment.company,
        branch: employeePayment.branch?.value ?? null,
        employee: employeePayment.employee._id,
        supervisor: employeePayment.supervisor._id,
        createdAt: employeePayment.createdAt
      }
    }).then((response) => {

      const createdEmployeePayment = {
        ...response.employeePayment,
        supervisor: employeePayment.supervisor,
        branch: employeePayment.branch,
        employee: {
          ...employeePayment.employee, // Conserva los datos originales del empleado
          ...response.employeePayment.employee, // Agrega campos de la respuesta si es necesario
        },
      };

      updateLastEmployeePayment({ createdEmployeePayment });

      if (response.income) {
        const createdIncome = {
          ...response.income,
          employee: employeePayment.supervisor,
          branch: employeePayment.branch,
        };
        pushIncome(createdIncome);
      }

      const createdExtraOutgoing = {
        ...response.extraOutgoing,
        employee: employeePayment.supervisor,
      };
      pushExtraOutgoing({ extraOutgoing: createdExtraOutgoing });

    }).catch((error) => {

      console.log(error)
      ToastSuccess(`No se registró el pago a ${employeePayment.employee.label} por ${stringToCurrency({ amount: employeePayment.amount })}`)
      spliceEmployeePayment({ index: 0 })

      return null
    })

    setLoading(false)
  }

  return { addEmployeePayment, loading }
}