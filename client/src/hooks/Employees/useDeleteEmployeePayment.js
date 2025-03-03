import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { deleteEmployeePaymentFetch } from "../../services/employees/deleteEmployeePayment"
import { currency } from "../../helpers/Functions"

export const useDeleteEmployeePayment = () => {

  const [loading, setLoading] = useState(false)

  const deleteEmployeePayment = async (employeePayment) => {

    setLoading(true)

    try {

      ToastSuccess(`Se borró el pago a ${employeePayment.employee.label ?? employeePayment.employee.name + ' ' + employeePayment.employee.lastName} por ${currency({ amount: employeePayment.amount })}`)

      await deleteEmployeePaymentFetch({ employeePaymentId: employeePayment._id, incomeId: (employeePayment?.income?._id ? employeePayment.income._id : employeePayment.income) ?? null, extraOutgoingId: employeePayment.extraOutgoing._id ? employeePayment.extraOutgoing._id : employeePayment.extraOutgoing})

    } catch (error) {

      ToastDanger(`No se borró el pago a ${employeePayment.employee.label ?? employeePayment.employee.name + ' ' + employeePayment.employee.lastName} por ${currency({ amount: employeePayment.amount })}`)
      console.log(error)

    } finally {

      setLoading(false)
    }

  }

  return { deleteEmployeePayment, loading }
}