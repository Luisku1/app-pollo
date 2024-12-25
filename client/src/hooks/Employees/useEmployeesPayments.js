import { useEffect, useState } from "react"
import { v4 } from 'uuid'
import { getEmployeesPaymentsFetch } from "../../services/employees/employeesPayments"
import { useAddEmployeePayment } from "./useAddEmployeePayment"
import { useDeleteEmployeePayment } from "./useDeleteEmployeePayment"

export const useEmployeesPayments = ({ companyId = null, date = null, initialPayments = [] }) => {

  const [payments, setPayments] = useState(initialPayments)
  const [total, setTotal] = useState(
    initialPayments.reduce((acc, payment) => acc + payment.amount, 0)
  )
  const { addEmployeePayment, loading: addLoading } = useAddEmployeePayment()
  const { deleteEmployeePayment, loading: deleteLoading } = useDeleteEmployeePayment()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const pushEmployeePayment = (employeePayment) => {

    setPayments((prevEmployeesPayments) => [employeePayment, ...prevEmployeesPayments])
    setTotal((prevTotal) => prevTotal + employeePayment.amount)
  }

  const spliceEmployeePaymentByIndex = (index) => {
    setPayments((prevPayments) => {
      const removedEmployeePayment = prevPayments[index]
      const newPayments = prevPayments.filter((_, i) => i !== index)
      setTotal((prevTotal) => prevTotal - removedEmployeePayment.amount)
      return newPayments
    })
  }

  const onAddEmployeePayment = async (employeePayment, pushIncome, pushExtraOutgoing) => {

    const tempId = v4()
    const tempEmployeePayment = { ...employeePayment, _id: tempId }
    try {

      pushEmployeePayment(tempEmployeePayment)

      const { income, extraOutgoing } = await addEmployeePayment(employeePayment)

      if (income) pushIncome?.(income)
      if (extraOutgoing) pushExtraOutgoing?.(extraOutgoing)

    } catch (error) {

      spliceEmployeePaymentByIndex(payments.findIndex((payment) => payment._id === tempId))
      console.log(error)
    }
  }

  const onDeleteEmployeePayment = async (employeePayment, index, spliceIncome, spliceExtraOutgoing) => {

    try {

      spliceEmployeePaymentByIndex(index)
      await deleteEmployeePayment(employeePayment)

      if (employeePayment.income) spliceIncome?.(employeePayment.income)
      if (employeePayment.extraOutgoing) spliceExtraOutgoing?.(employeePayment.extraOutgoing)

    } catch (error) {

      pushEmployeePayment(employeePayment)
      console.log(error)
    }
  }

  useEffect(() => {

    if (!companyId || !date) return

    setLoading(true)

    setPayments([])
    setTotal(0.0)

    getEmployeesPaymentsFetch({ companyId, date }).then((response) => {

      setPayments(response.employeesPayments)
      setTotal(response.totalEmployeesPayments)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [companyId, date])

  return {
    payments,
    setPayments,
    total,
    pushEmployeePayment,
    onDeleteEmployeePayment,
    onAddEmployeePayment,
    loading: loading || addLoading || deleteLoading,
    error
  }
}