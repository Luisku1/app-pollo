import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { deleteEmployeePaymentFetch } from "../../services/employees/deleteEmployeePayment"
import { stringToCurrency } from "../../helpers/Functions"

export const useDeleteEmployeePayment = () => {

  const [loading, setLoading] = useState(false)

  const deleteEmployeePayment = (employeePayment, index, spliceEmployeePayment, spliceIncomeById, spliceExtraOutgoingById, updateParentArrays) => {

    setLoading(true)
    spliceEmployeePayment({ index })
    updateParentArrays({
      incomeId: employeePayment.income,
      extraOutgoingId: employeePayment.extraOutgoing,
      amount: employeePayment.amount,
    })
    ToastSuccess(`Se borró el pago a ${employeePayment.employee.label ?? employeePayment.employee.name + ' ' + employeePayment.employee.lastName} por ${stringToCurrency({ amount: employeePayment.amount })}`)

    deleteEmployeePaymentFetch({ employeePaymentId: employeePayment._id, incomeId: employeePayment.income ?? null, extraOutgoingId: employeePayment.extraOutgoing }).then(() => {

      // spliceIncomeById(employeePayment.income)
      // spliceExtraOutgoingById({ extraOutgoingId: employeePayment.extraOutgoing, amount: employeePayment.amount })

    }).catch((error) => {

      ToastDanger(`No se borró el pago a ${employeePayment.employee.label ?? employeePayment.employee.name + ' ' + employeePayment.employee.lastName} por ${stringToCurrency({ amount: employeePayment.amount })}`)
      console.log(error)
    })

    setLoading(false)

  }

  return { deleteEmployeePayment, loading }
}