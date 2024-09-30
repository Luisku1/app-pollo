import { useEffect, useState } from "react"
import { getBranchProviderInputsAvgFetch } from "../../services/ProvidersInputs/getBranchProviderInputsAvg"

export const useBranchProviderInputsAvg = ({ branchId }) => {

  const [branchProviderInputsAvg, setBranchProviderInputsAvg] = useState(0.0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if (!branchId) return

    setLoading(true)

    getBranchProviderInputsAvgFetch({ branchId }).then((response) => {

      setBranchProviderInputsAvg(response.branchProviderInputsAvg * 0.6)

    }).catch((error) => {
      console.log(error)

      setError(error)
    })

    setLoading(false)

  }, [branchId])

  return { branchProviderInputsAvg, loading, error }
}