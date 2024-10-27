import { useState } from "react"

export const useEmployeesPaymentsArray = (initialPayments = [], initialTotal = 0.0) => {

  const [payments, setPayments] = useState(initialPayments)
  const [total, setTotal] = useState(initialTotal)

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