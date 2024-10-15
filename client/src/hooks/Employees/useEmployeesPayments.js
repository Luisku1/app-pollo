import { useEffect, useState } from "react"
import { getEmployeesPaymentsFetch } from "../../services/employees/employeesPayments"

export const useEmployeesPayments = ({ companyId, date }) => {

  const [employeesPayments, setEmployeesPayments] = useState([])
  const [totalEmployeesPayments, setTotalEmployeesPayments] = useState(0.0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const pushEmployeePayment = ({ employeePayment }) => {

    setEmployeesPayments((prevEmployeesPayments) => [employeePayment, ...prevEmployeesPayments])
    setTotalEmployeesPayments((prevTotal) => prevTotal + employeePayment.amount)
  }

  const spliceEmployeePayment = ({ index }) => {

    const removedEmployeePayment = employeesPayments.splice(index, 1)
    setTotalEmployeesPayments((prevTotal) => prevTotal - removedEmployeePayment[0].amount)
  }

  const updateLastEmployeePayment = ({ createdEmployeePayment }) => {

    setEmployeesPayments((prevEmployeesPayments) => prevEmployeesPayments.map((employeePayment, index) =>

      index == 0 ? createdEmployeePayment : employeePayment
    ))
  }

  useEffect(() => {

    if (!companyId || !date) return

    setLoading(true)

    setEmployeesPayments([])
    setTotalEmployeesPayments(0.0)

    getEmployeesPaymentsFetch({ companyId, date }).then((response) => {

      setEmployeesPayments(response.employeesPayments)
      setTotalEmployeesPayments(response.totalEmployeesPayments)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [companyId, date])

  return { employeesPayments, totalEmployeesPayments, pushEmployeePayment, spliceEmployeePayment, updateLastEmployeePayment, loading, error }
}