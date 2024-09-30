import { useEffect, useState } from "react"
import { getBranchInputsAvgFetch } from "../../services/Inputs/getBranchInputsAvg"

export const useBranchInputsAvg = ({ branchId }) => {

  const [branchInputsAvg, setBranchInputsAvg] = useState(0.0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if (!branchId) return

    setLoading(true)

    getBranchInputsAvgFetch({ branchId }).then((response) => {

      setBranchInputsAvg(response.branchInputsAvg * 0.6)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [branchId])

  return { branchInputsAvg, loading, error }
}