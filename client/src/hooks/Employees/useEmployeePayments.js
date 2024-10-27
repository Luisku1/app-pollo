import { useEffect, useState } from "react"
import { getEmployeePayments } from "../../services/employees/employeePayments"
import { useEmployeesPaymentsArray } from "./useEmployeesPaymentsArray"

export const useEmployeePayments = ({ employeeId, date }) => {

  const { payments, setPayments, total, setTotal, pushEmployeePayment, spliceEmployeePayment, updateLastEmployeePayment } = useEmployeesPaymentsArray()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if (!employeeId || !date) return

    setLoading(true)

    getEmployeePayments({ employeeId, date }).then((response) => {

      setPayments(response.employeePayments)
      setTotal(response.total)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [employeeId, date, setPayments, setTotal])

  return { payments, total, pushEmployeePayment, spliceEmployeePayment, updateLastEmployeePayment, loading, error }
}