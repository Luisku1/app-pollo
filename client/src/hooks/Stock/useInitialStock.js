import { useEffect, useState } from "react"
import { getInitialStockFetch } from "../../services/Stock/getInitialStock"

export const useInitialStock = ({ branchId, date }) => {

  const [initialStock, setInitialStock] = useState(0)
  const [loading, setLoading] = useState(false)


  useEffect(() => {

    if (!branchId || !date) return

    setLoading(true)

    getInitialStockFetch({ branchId, date }).then((response) => {

      setInitialStock(response.initialStock)

    }).catch((error) => {

      console.log(error)
    })

    setLoading(false)

  }, [branchId, date])

  return {initialStock, loading}
}