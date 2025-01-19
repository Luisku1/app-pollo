import { useEffect, useMemo, useState } from "react"
import { getInitialStockFetch } from "../../services/Stock/getInitialStock"

export const useInitialStock = ({ branchId, date, initialArray = null }) => {

  const [initialStock, setInitialStock] = useState([])
  const [loading, setLoading] = useState(false)

  const initialize = (array) => {
    setInitialStock(array);
  };

  useEffect(() => {
    if (initialArray) {
      initialize(initialArray)
    }
  }, [initialArray])

  useEffect(() => {

    if (!branchId || !date) return

    setInitialStock([])

    const fetchInitialStock = async () => {
      setLoading(true)
      try {
        const response = await getInitialStockFetch(branchId, date)
        setInitialStock(response.initialStock)

      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialStock()

  }, [branchId, date, initialArray])

  const { initialStockWeight, initialStockAmount } = useMemo(() => {
    return {
      initialStockWeight: initialStock.reduce((acc, item) => acc + item.weight, 0),
      initialStockAmount: initialStock.reduce((acc, item) => acc + item.amount, 0)
    }
  }, [initialStock])

  return {
    initialStock,
    initialStockWeight,
    initialStockAmount,
    loading,
    initialize
  }
}