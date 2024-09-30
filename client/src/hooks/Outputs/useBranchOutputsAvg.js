import { useEffect, useState } from "react"
import { getBranchOutputsAvgFetch } from "../../services/Outputs/getBranchOutputsAvg"

export const useBranchOutputsAvg = ({ branchId }) => {

  const [branchOutputsAvg, setBranchOutputsAvg] = useState(0.0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if (!branchId) return

    setLoading(true)

    getBranchOutputsAvgFetch({ branchId }).then((response) => {

      setBranchOutputsAvg(response.branchOutputsAvg * 0.6)

    }).catch((error) => {

      console.log(error)

      setError(error)
    })

    setLoading(false)

  }, [branchId])

  return { branchOutputsAvg, loading, error }
}