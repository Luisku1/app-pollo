import { useEffect, useState } from "react"
import { getBranchPricesFetch } from "../../services/Prices/getBranchPrices"

export const useBranchPrices = ({ branchId, date }) => {

  const [branchPrices, setBranchPrices] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    setLoading(true)

    getBranchPricesFetch({ branchId, date }).then((response) => {

      setBranchPrices(response.branchPrices)

    }).catch((error) => {

      console.log(error)
    })

    setLoading(false)

  }, [branchId, date])

  return { branchPrices, loading }
}