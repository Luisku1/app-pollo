import { useEffect, useState } from "react"
import { getCustomersNameList } from "../../services/customers/customersNameList"

export const useCustomers = ({ companyId }) => {

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if (!companyId) return

    setLoading(true)

    getCustomersNameList({ companyId }).then((response) => {

      setCustomers(response)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [companyId])

  return { customers, error, loading }
}