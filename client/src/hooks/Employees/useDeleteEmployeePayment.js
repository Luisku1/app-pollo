import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { deleteEmployeePaymentFetch } from "../../services/employees/deleteEmployeePayment"
import { stringToCurrency } from "../../helpers/Functions"

export const useDeleteEmployeePayment = () => {

  const [loading, setLoading] = useState(false)

  const deleteEmployeePayment = async (employeePayment) => {

    setLoading(true)

    try {
      ToastSuccess(`Se borró el pago a ${employeePayment.employee.label ?? employeePayment.employee.name + ' ' + employeePayment.employee.lastName} por ${stringToCurrency({ amount: employeePayment.amount })}`)

      await deleteEmployeePaymentFetch({ employeePaymentId: employeePayment._id, incomeId: employeePayment.income ?? null, extraOutgoingId: employeePayment.extraOutgoing })

    } catch (error) {
      ToastDanger(`No se borró el pago a ${employeePayment.employee.label ?? employeePayment.employee.name + ' ' + employeePayment.employee.lastName} por ${stringToCurrency({ amount: employeePayment.amount })}`)
      console.log(error)
    } finally {
      setLoading(false)
    }

  }

  return { deleteEmployeePayment, loading }
}