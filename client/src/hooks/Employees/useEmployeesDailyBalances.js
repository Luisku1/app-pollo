import { useEffect, useState } from "react"
import { getEmployeesDailyBalancesFetch } from "../../services/employees/getEmployeesDailyBalances"

export const useEmployeesDailyBalances = ({ companyId, date }) => {

  const [employeesDailyBalances, setEmployeesDailyBalances] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {

    if (!(companyId && date)) return

    setLoading(true)

    getEmployeesDailyBalancesFetch({ companyId, date }).then((response) => {

      setEmployeesDailyBalances(response.employeesDailyBalances)

    }).catch((error) => {

      setError(error)
      console.log(error)
    })

    setLoading(false)

  }, [companyId, date])

  return {
    employeesDailyBalances,
    loading,
    error
  }
}