import { useEffect, useState } from "react"
import { getBranchPricesFetch } from "../../services/Prices/getBranchPrices"
import useChangePrices from "./useChangePrices"

export const useBranchPrices = ({ branchId, date }) => {

  const [prices, setPrices] = useState(null)
  const { changePrices } = useChangePrices()
  const [loading, setLoading] = useState(false)

  const onChangePrices = async (newPrices, date, newPricesDate, onUpdateBranchReport) => {

    let tempPrices = [...prices]

    try {

      await changePrices(branchId, date, newPricesDate)
      setPrices(newPrices)
      await onUpdateBranchReport()

    } catch (error) {

      setPrices(tempPrices)
      console.log(error)
    }
  }

  useEffect(() => {

    if (!branchId || !date) return

    setLoading(true)

    const fetchPrices = async () => {
      try {
        const response = await getBranchPricesFetch(branchId, date)
        setPrices(response.branchPrices)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()

  }, [branchId, date])

  return { prices, onChangePrices, loading }
}