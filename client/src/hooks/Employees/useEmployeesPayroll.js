import { useEffect, useState } from "react"
import { getEmployeesPayrollFetch } from "../../services/employees/getEmployeesPayroll"
import { ToastDanger } from "../../helpers/toastify"

export const useEmployeesPayroll = ({ companyId, date }) => {

  const [employeesPayroll, setEmployeesPayroll] = useState()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if (!companyId || !date) return

    setLoading(true)

    getEmployeesPayrollFetch({companyId, date}).then((response) => {

      setEmployeesPayroll(response.employeesPayroll)

    }).catch((error) => {

      ToastDanger(error.message)
      setError(error)
    })

    setLoading(false)

  }, [companyId, date])

  return {employeesPayroll, loading, error}
}