import { useEffect, useState } from "react"
import { getBranchAvg } from "../../services/branches/getBranchAvg"

export const useBranchAvg = ({branchId}) => {

  const [branchAvg, setBranchAvg] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if(!branchId) return

    setLoading(true)

    getBranchAvg({branchId}).then((response) => {

      setBranchAvg(response)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [branchId])

  return {branchAvg, loading, error}
}