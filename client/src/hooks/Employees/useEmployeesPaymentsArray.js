import { useState } from "react"

export const useEmployeesPaymentsArray = (initialPayments = []) => {

  const [payments, setPayments] = useState(initialPayments)
  const [total, setTotal] = useState(
    initialPayments.reduce((acc, payment) => acc + payment.amount, 0)
  )

  const pushEmployeePayment = ({ employeePayment }) => {

    setPayments((prevEmployeesPayments) => [employeePayment, ...prevEmployeesPayments])
    setTotal((prevTotal) => prevTotal + employeePayment.amount)
  }

  const spliceEmployeePayment = ({ index }) => {

    const removedEmployeePayment = payments.splice(index, 1)
    setTotal((prevTotal) => prevTotal - removedEmployeePayment[0].amount)
  }

  const updateLastEmployeePayment = ({ createdEmployeePayment }) => {

    setPayments((prevEmployeesPayments) => prevEmployeesPayments.map((employeePayment, index) =>

      index == 0 ? createdEmployeePayment : employeePayment
    ))
  }

  return {
    payments,
    setPayments,
    total,
    setTotal,
    pushEmployeePayment,
    spliceEmployeePayment,
    updateLastEmployeePayment
  }
}