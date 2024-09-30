import { useEffect, useState } from "react"
import { getEmployeePayments } from "../../services/employees/employeePayments"

export const useEmployeePayments = ({ employeeId, date }) => {

  const [employeePayments, setEmployeePayments] = useState()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if (!employeeId || !date) return

    setLoading(true)

    getEmployeePayments({ employeeId, date }).then((response) => {

      setEmployeePayments(response)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [employeeId, date])

  return { employeePayments, loading, error }
}