import { useEffect, useState } from "react"
import { getBranchesNameList } from "../../services/branches/branchesNameList"

export const useBranches = ({ companyId }) => {

  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if (!companyId) return

    setLoading(true)

    getBranchesNameList({ companyId }).then((response) => {

      setBranches(response)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [companyId])

  return {branches, loading, error}
}