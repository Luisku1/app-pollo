import { useEffect, useState } from "react"
import { getInitialStockFetch } from "../../services/Stock/getInitialStock"

export const useInitialStock = ({ branchId, date, initialArray = [] }) => {

  const [initialStock, setInitialStock] = useState(initialArray)
  const [initialStockTotal, setInitialStockTotal] = useState(

    initialArray.reduce((acc, item) => acc + item.amount, 0)
  )
  const [loading, setLoading] = useState(false)

  const calculateTotal = (initialStockList) => {

    setInitialStockTotal(initialStockList.reduce((acc, item) => acc + item.amount, 0))
  }

  useEffect(() => {

    if (initialArray.length > 0) return
    if (!branchId || !date) return

    const fetchInitialStock = async () => {
      setLoading(true)
      try {
        const response = await getInitialStockFetch(branchId, date)
        setInitialStock(response.initialStock)
        calculateTotal(response.initialStock)

      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialStock()

  }, [branchId, date, initialArray])

  return {
    initialStock,
    initialStockTotal,
    loading
  }
}