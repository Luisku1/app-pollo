import { useEffect, useMemo, useState } from "react"
import { getEmployeesPaymentsFetch } from "../../services/employees/employeesPayments"
import { useAddEmployeePayment } from "./useAddEmployeePayment"
import { useDeleteEmployeePayment } from "./useDeleteEmployeePayment"
import { getEmployeePayments } from "../../services/employees/employeePayments"
import { Types } from "mongoose";

export const useEmployeesPayments = ({ companyId = null, date = null, employeeId = null, initialPayments = [] }) => {

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

  const onAddEmployeePayment = async (employeePayment, pushIncome, spliceIncomeById, pushExtraOutgoing, spliceExtraOutgoingById) => {

    const tempId = new Types.ObjectId().toHexString()
    const incomeId = new Types.ObjectId().toHexString()
    const date = new Date()

    const income = {
      _id: incomeId,
      amount: employeePayment.amount,
      branch: employeePayment.branch,
      employee: employeePayment.employee,
      partOfAPayment: true,
      createdAt: date,
    }
    const extraOutgoingId = new Types.ObjectId().toHexString()
    const extraOutgoing = {
      _id: extraOutgoingId,
      amount: employeePayment.amount,
      concept: employeePayment.detail,
      employee: employeePayment.employee,
      partOfAPayment: true,
      createdAt: date,
    }
    const tempEmployeePayment = { ...employeePayment, _id: tempId, income: employeePayment.branch ? incomeId : null, extraOutgoing: extraOutgoingId }
    try {

      pushEmployeePayment(tempEmployeePayment)
      if (income) pushIncome?.(income)
      if (extraOutgoing) pushExtraOutgoing?.(extraOutgoing)

      await addEmployeePayment(tempEmployeePayment)


    } catch (error) {

      spliceIncomeById?.(incomeId)
      spliceExtraOutgoingById?.(extraOutgoingId)
      spliceEmployeePaymentByIndex(payments.findIndex((payment) => payment._id === tempId))
      console.log(error)
    }
  }

  const onDeleteEmployeePayment = async (employeePayment, spliceIncome, spliceExtraOutgoing) => {

    try {

      spliceEmployeePaymentByIndex(employeePayment.index)
      await deleteEmployeePayment(employeePayment)

      if (employeePayment.income) spliceIncome?.(employeePayment.income._id ? employeePayment.income._id : employeePayment.income)
      if (employeePayment.extraOutgoing) spliceExtraOutgoing?.(employeePayment.extraOutgoing._id ? employeePayment.extraOutgoing._id : employeePayment.extraOutgoing)

    } catch (error) {

      pushEmployeePayment(employeePayment)
      console.log(error)
    }
  }

  const sortedPayments = useMemo(() => {

    return payments.sort((a, b) => b.amount - a.amount)

  }, [payments])

  useEffect(() => {

    if ((!companyId && !employeeId)) return

    setLoading(true)

    setPayments([])
    setTotal(0.0)

    if (employeeId) {

      getEmployeePayments({ employeeId, date }).then((response) => {

        setPayments(response.employeePayments)
        setTotal(response.total)

      }).catch((error) => {

        setError(error)
      })

    } else {

      getEmployeesPaymentsFetch({ companyId, date }).then((response) => {

        setPayments(response.employeesPayments)
        setTotal(response.totalEmployeesPayments)

      }).catch((error) => {

        setError(error)
      })
    }

    setLoading(false)

  }, [companyId, date, employeeId])

  return {
    payments: sortedPayments,
    setPayments,
    total,
    pushEmployeePayment,
    onDeleteEmployeePayment,
    onAddEmployeePayment,
    loading: loading || addLoading || deleteLoading,
    error
  }
}