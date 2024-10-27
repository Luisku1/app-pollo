import { useEffect, useState } from "react"
import { getEmployeesPaymentsFetch } from "../../services/employees/employeesPayments"
import { useEmployeesPaymentsArray } from "./useEmployeesPaymentsArray"

export const useEmployeesPayments = ({ companyId, date }) => {

  const { payments: employeesPayments, setPayments: setEmployeesPayments, total: totalEmployeesPayments, setTotal: setTotalEmployeesPayments, pushEmployeePayment, spliceEmployeePayment, updateLastEmployeePayment } = useEmployeesPaymentsArray()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

  }, [companyId, date, setEmployeesPayments, setTotalEmployeesPayments])

  return {
    employeesPayments,
    totalEmployeesPayments,
    pushEmployeePayment,
    spliceEmployeePayment,
    updateLastEmployeePayment,
    loading,
    error
  }
}