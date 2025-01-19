import { useEffect, useState } from "react"
import { getBranchPricesFetch } from "../../services/Prices/getBranchPrices"

export const usePricesSelector = (branchId, date, pricesDate = null, sortOrder = null) => {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if((!branchId || !date) || ((pricesDate && !sortOrder) || (!pricesDate && sortOrder))) return

    const fetchPrices = async () => {
      try {
        setLoading(true)
        const prices = await getBranchPricesFetch(branchId, date, pricesDate, sortOrder)
        setPrices(prices.branchPrices)
        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }

    fetchPrices()
  }, [date, branchId, pricesDate, sortOrder])

  return { prices, loading, error }
}