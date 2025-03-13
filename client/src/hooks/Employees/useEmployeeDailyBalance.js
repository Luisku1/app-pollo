import { useEffect, useState } from "react"
import { getEmployeeDailyBalanceFetch } from "../../services/employees/getEmployeeDailyBalance"

export const useEmployeeDailyBalance = (employeeId) => {

  const [employeeDailyBalance, setEmployeeDailyBalance] = useState()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleDailyBalanceInputs = async (e, dailyBalanceId) => {

    try {

      const res = await fetch('/api/employee/update-daily-balance/' + dailyBalanceId, {

        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({

          [e.target.id]: e.target.checked
        })
      })

      const data = await res.json()

      if (data.success === false) {

        e.target.checked = !e.target.checked
        return
      }

    } catch (error) {

      e.target.checked = !e.target.checked
    }
  }

  useEffect(() => {

    if (!employeeId) return

    setLoading(true)

    try {

      getEmployeeDailyBalanceFetch(employeeId).then((response) => {

        setEmployeeDailyBalance(response)

      }).catch((error) => {

        setError(error)
      })

    } catch (error) {

      setError(error)
    }
    setLoading(false)

  }, [employeeId])

  return { employeeDailyBalance, loading, error, handleDailyBalanceInputs }
}