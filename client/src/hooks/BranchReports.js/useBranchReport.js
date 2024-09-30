import { useEffect, useState } from "react"
import { getBranchReport } from "../../services/BranchReports/getBranchReport"

export const useBranchReport = ({ branchId, date }) => {

  const [branchReport, setBranchReport] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if (!branchId || !date) return

    setLoading(true)

    getBranchReport({ branchId, date }).then((response) => {

      setBranchReport(response)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [branchId, date])

  return { branchReport, loading, error }
}